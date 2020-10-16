<?php
/**
 * C O R R A
 */

declare(strict_types=1);

namespace Corra\IdmeGraphQl\Model\Resolver;

use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;

use Magento\QuoteGraphQl\Model\Cart\GetCartForUser;
use Magento\Store\Model\StoreManagerInterface;
use IDme\GroupVerification\Helper\Data;

class IdmePolicies implements ResolverInterface
{

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;
    /**
     * @var GetCartForUser
     */
    private $getCartForUser;
    /**
     * @var Data
     */
    private $idmedata;

    private $cartData;

    /**
     * IdmePolicies constructor.
     * @param StoreManagerInterface $storeManager
     * @param Data $idmedata
     * @param GetCartForUser $getCartForUser
     */
    public function __construct(
        StoreManagerInterface $storeManager,
        Data $idmedata,
        GetCartForUser $getCartForUser
    )
    {
        $this->storeManager = $storeManager;
        $this->idmedata = $idmedata;
        $this->getCartForUser = $getCartForUser;
    }

    /**
     * @inheritDocvv   hhhhhhhhhhhhghhhhb
     */
    public function resolve(Field $field, $context, ResolveInfo $info, array $value = null, array $args = null)
    {
        if (!isset($value['model'])) {
            throw new LocalizedException(__('"model" value should be specified'));
        }
        if (empty($args['input']['cart_id'])) {
            //  throw new GraphQlInputException(__('Required parameter "cart_id" is missing'));
        }
        $id=$value['model']->getId();
        $maskedCartId = $args['cart_id'];
        $storeId = (int)$context->getExtensionAttributes()->getStore()->getId();
        $cart = $this->getCartForUser->execute($maskedCartId, $context->getUserId(), $storeId);
        if ($cart) {
            $this->cartData = $cart->getData();
        }
        $policies = $this->policies();

        $idmeData = [
            'clientId' => $this->idmedata->getKey('client_id'),
            'verified' => $this->getIsVerified(),
            'verifiedGroup' => $this->getUserGroup(),
            'policies' => $policies,
            'aboutText' => $this->idmedata->getKey('about'),
        ];
        return ['idme_data' => $idmeData];
    }

    function policies()
    {
        $policies = [];
        $policiesArray = $this->idmedata->getPolicies();

        foreach ($policiesArray as $policy) {
            $policyArray = [];
            $policyArray['img_src'] = $policy['img_url'];
            $policyArray['name'] = $policy['name'];
            $policyArray['popup_url'] = $policy['popup_url'];
            array_push($policies, $policyArray);
        }

        return $policies;
    }

    /**
     * @return bool
     */
    private function getIsVerified()
    {
        return $this->getUserGroup() !== null;
    }

    /**
     * @return mixed
     */
    public function getUserGroup()
    {
        return $this->cartData['idme_group'];
    }
}
