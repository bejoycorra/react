<?php
/**
 * C O R R A
 */
declare(strict_types=1);
namespace Corra\IdmeGraphQl\Model\Resolver;

use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Exception\GraphQlAuthorizationException;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\QuoteGraphQl\Model\Cart\GetCartForUser;
use IDme\GroupVerification\Helper\Data;
use Magento\Quote\Model\QuoteRepository;


/**
 *  class VerifyIdme, verify idme login information and save to quote table
 */
class VerifyIdme implements ResolverInterface
{
    /**
     * @var Data
     */
    private $idmedata;
    /**
     * @var \IDme\GroupVerification\Helper\Oauth
     */
    protected $oauth;
    /**
     * @var \Magento\Quote\Model\Quote
     */
    protected $quote;
    /**
     * @var QuoteRepository
     */
    protected $quoteRepository;
    /**
     * @var GetCartForUser
     */
    private $getCartForUser;
    /**
     * VerifyIdme constructor.
     * @param Data $idmedata
     * @param QuoteRepository $quoteRepository
     * @param GetCartForUser $getCartForUser
     */
    public function __construct(
        Data $idmedata,
        QuoteRepository $quoteRepository,
        GetCartForUser $getCartForUser
    ) {
        $this->idmedata = $idmedata;
        $this->quoteRepository = $quoteRepository;
        $this->oauth = $idmedata->getOauth();
        $this->getCartForUser = $getCartForUser;
    }

    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        array $value = null,
        array $args = null
    ) {
        if (empty($args['input']) || !is_array($args['input'])) {
            throw new GraphQlInputException(__('"input" value should be specified'));
        }
        $args = $args['input'];

        if (!isset($args['cart_id'])) {
            throw new GraphQlInputException(__('cart_id of the VerifyIdme should be specified'));
        }
        if (!isset($args['idme_code'])) {
           throw new GraphQlInputException(__('ID.me verification failed, please contact the store owner (code 101).'));
        }
        {
            $maskedCartId = $args['cart_id'];
            $storeId = (int)$context->getExtensionAttributes()->getStore()->getId();
            $this->quote = $this->getCartForUser->execute($maskedCartId, $context->getUserId(), $storeId);
            $idmeCode = $args['idme_code'];
            $tokenData = $this->oauth->getAccessToken($idmeCode);
            $token = $tokenData['access_token'];
            /* request user profile data with the token */
            $data = $this->oauth->getProfileData($token);
            if (empty($data)) {
                $result['code'] = 'error';
                $result['message'] = __('ID.me verification failed, please contact the store owner (code 102).');
            } else {
                $success = $this->setUserData($data);
                if ($success) {
                   // $response['code'] = 'ok';
                    $response['message'] = __('Successfully verified your affiliation via ID.me');
                 //   $response['userData'] = json_encode($data);
                } else {
                    $response['code'] = 'error';
                    $response['message'] = __('Unfortunately, you have not verified your affiliation with ID.me.');
                }
            }
            return [
                'cart' => [
                    'model' => $this->quote,
                ]
            ];
        }

    }

    /**
     * @param $profile
     * @return mixed
     * @throws \Zend_Http_Client_Exception
     */
    public function setUserData($profile)
    {
        //$this->quote = $this->checkoutSession->getQuote();

        $attributes = $profile['attributes'];
        foreach ($attributes as $attribute) {
            if ($attribute['handle'] === 'uuid') {
                $this->quote->setData('idme_uuid', $attribute['value']);
                //$this->customerSession->setData('idme_uuid', $attribute['value']);
            }
        }

        $status = $profile['status'][0];
        if ($status['verified']) {
            $this->quote->setData('idme_verify_started', 1);
            $this->quote->setData('idme_group', $status['group']);
            $subgroups = $this->getSubgroupHandles($status['group'], $status['subgroups']);
            $this->quote->setData('idme_subgroups', json_encode($subgroups));
        }
        $this->quoteRepository->save($this->quote);

        return $status['verified'];
    }

    /**
     * @param $group
     * @param $subgroups
     * @return array
     * @throws \Zend_Http_Client_Exception
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function getSubgroupHandles($group, $subgroups)
    {
        $values = [];

        foreach ($this->idmedata->getPolicies() as $policy) {
            foreach ($policy['groups'] as $affiliation) {
                if ($affiliation['handle'] === $group) {
                    foreach ($affiliation['subgroups'] as $subgroup) {
                        if (in_array($subgroup['name'], $subgroups, true)) {
                            $values[] = $subgroup['handle'];
                        }
                    }
                }
            }
        }
        return $values;
    }

}
