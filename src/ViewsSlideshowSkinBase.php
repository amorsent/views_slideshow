<?php

namespace Drupal\views_slideshow;

use Drupal\Component\Plugin\PluginBase;

abstract class ViewsSlideshowSkinBase extends PluginBase implements ViewsSlideshowSkinInterface {

  /**
   * {@inheritdoc}
   */
  public function getLabel() {
    return $this->pluginDefinition['label'];
  }

  /**
   * {@inheritdoc}
   */
  public function getClass() {
    return $this->pluginDefinition['id'];
  }

  /**
   * {@inheritdoc}
   */
  public function getLibraries() {
    return $this->pluginDefinition['libraries'];
  }
}
