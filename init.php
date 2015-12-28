<?php

use Bolt\Extension\Cainc\Commenting\Extension;

if (isset($app)) {
    $app['extensions']->register(new Extension($app));
}
