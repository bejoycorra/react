<?php

namespace Corra\IdmeGraphQl\Model\Rule\Condition;

use Magento\Rule\Model\Condition\Context;
use Magento\Rule\Model\Condition\AbstractCondition;
/**
 * Class IDmeRules
 * @package Corra\IdmeGraphQl\Model\Rule\Condition
 */
class IDmeRules extends \IDme\GroupVerification\Model\Rule\Condition\IDmeRules
{

    /**
     * IDmeRules constructor.
     * @param Context $context
     * @param array $data
     */
    public function __construct(
        Context $context,
        array $data = []
    ) {

    }

    /**
     * Validate ID.me verification
     * @param \Magento\Framework\Model\AbstractModel $model
     * @return bool
     */
    public function validate(\Magento\Framework\Model\AbstractModel $model)
    {
        $verified = 0;

        if ($model->getQuote()->getIdmeGroup()) {
            $verified = $model->getQuote()->getIdmeGroup();
        }
        $model->setData('idme_verification', $verified);
        return AbstractCondition::validate($model);
    }

}
