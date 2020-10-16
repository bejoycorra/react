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

use IDme\GroupVerification\Helper\Data;


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
     * VerifyIdme constructor.
     * @param Data $idmedata
     */
    public function __construct(
        Data $idmedata
    ) {
        $this->idmedata = $idmedata;
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
            throw new GraphQlInputException(__('idme_code of the VerifyIdme should be specified'));
        }
        {
            $cartId = $args['cart_id'];
            $idmeCode = $args['idme_code'];

        }

    }

}
