<?php
declare(strict_types=1);

namespace Corra\AmastyProductAttachmentGraphQl\Model\Resolver;

use Amasty\ProductAttachment\Controller\Adminhtml\RegistryConstants;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Amasty\ProductAttachment\Model\ConfigProvider;
use Amasty\ProductAttachment\Model\File\FileScope\FileScopeDataProvider;
use Magento\Store\Model\StoreManagerInterface;

class AmastyProductAttachments implements ResolverInterface
{
    protected $configProvider;

    /**
     * @var FileScopeDataProvider
     */
    private $fileScopeDataProvider;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * AmastyProductAttachments constructor.
     * @param ConfigProvider $configProvider
     * @param FileScopeDataProvider $fileScopeDataProvider
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        ConfigProvider $configProvider,
        FileScopeDataProvider $fileScopeDataProvider,
        StoreManagerInterface $storeManager
    ) {
        $this->configProvider = $configProvider;
        $this->fileScopeDataProvider = $fileScopeDataProvider;
        $this->storeManager = $storeManager;
    }

    /**
     * @inheritDoc
     */
    public function resolve(Field $field, $context, ResolveInfo $info, array $value = null, array $args = null)
    {
        if (!isset($value['model'])) {
            throw new LocalizedException(__('"model" value should be specified'));
        }
        $product = $value['model'];
        $files = $this->fileScopeDataProvider->execute(
            [
                RegistryConstants::PRODUCT => $product->getId(),
                RegistryConstants::STORE => $this->storeManager->getStore()->getId(),
                RegistryConstants::EXTRA_URL_PARAMS => [
                    'product' => (int)$product->getId()
                ]
            ],
            'frontendProduct'
        );
        $productAttachments = [];
        $isShowTab = 0;
        foreach ($files as $file) {
            $productAttachment['icon_url'] = $file->getIconUrl();
            $productAttachment['size'] = $file->getReadableFileSize();
            $productAttachment['file_label'] = $file->getLabel();
            $productAttachment['file_url'] = $file->getFrontendUrl();
            array_push($productAttachments, $productAttachment);
        }
        if ($this->configProvider->isBlockEnabled() && count($productAttachments) > 0) {
            $isShowTab = 1;
        }

        return [
            'is_enabled' => $this->configProvider->isEnabled(),
            'is_show_tab' => $isShowTab,
            'tab_title' => $this->configProvider->getBlockTitle(),
            'is_show_icon' => $this->configProvider->isShowIcon(),
            'is_show_size' => $this->configProvider->isShowFilesize(),
            "product_attachments_data" => $productAttachments
        ];
    }
}
