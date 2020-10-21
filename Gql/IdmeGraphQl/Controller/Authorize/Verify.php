<?php

namespace Corra\IdmeGraphQl\Controller\Authorize;

use Magento\Checkout\Model\Session;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;
use IDme\GroupVerification\Helper\Data;
use Magento\Framework\View\Result\PageFactory;
use Magento\Quote\Model\QuoteRepository;

/**
 * Class Verify
 * @package Corra\IdmeGraphQl\Controller\Authorize
 */
class Verify extends \Magento\Framework\App\Action\Action
{
    /**
     * @var Data
     */
    protected $helper;
    /**
     * @var \IDme\GroupVerification\Helper\Oauth
     */
    protected $oauth;
    /**
     * @var Session
     */
    protected $checkoutSession;
    /**
     * @var \Magento\Framework\App\RequestInterface
     */
    protected $request;
    /**
     * @var \Magento\Quote\Model\Quote
     */
    protected $quote;
    /**
     * @var QuoteRepository
     */
    protected $quoteRepository;

    /**
     * @var PageFactory
     */
    protected $pageFactory;

    /**
     * @var \Magento\Customer\Model\Session
     */
    protected $customerSession;

    /**
     * Verify constructor.
     * @param Context $context
     * @param Data $helper
     * @param Session $checkoutSession
     * @param QuoteRepository $quoteRepository
     * @param PageFactory $pageFactory
     * @param \Magento\Customer\Model\Session $customerSession
     */
    public function __construct(
        Context $context,
        Data $helper,
        Session $checkoutSession,
        QuoteRepository $quoteRepository,
        PageFactory $pageFactory,
        \Magento\Customer\Model\Session $customerSession
    ) {
        $this->helper = $helper;
        $this->oauth = $helper->getOauth();
        $this->checkoutSession = $checkoutSession;
        $this->request = $context->getRequest();
        $this->quoteRepository = $quoteRepository;
        $this->pageFactory = $pageFactory;
        $this->customerSession = $customerSession;
        parent::__construct($context);
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface|\Magento\Framework\Controller\ResultInterface|void
     * @throws \Zend_Http_Client_Exception
     */
    public function execute()
    {
        $resultPage = $this->pageFactory->create();
        $block = $resultPage->getLayout()
            ->createBlock(\IDme\GroupVerification\Block\Cart\Buttons::class)
            ->setTemplate('Corra_IdmeGraphQl::verified.phtml')
            ->toHtml();

        $this->getResponse()->setBody($block);
    }
}
