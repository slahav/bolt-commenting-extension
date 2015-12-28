<?php

namespace Bolt\Extension\Cainc\Commenting;

use Bolt\Application;
use Bolt\BaseExtension;

class Extension extends BaseExtension
{

    /**
     * construct
     */
    public function __construct(Application $app)
    {
        parent::__construct($app);
        // Functionality we're adding applies only to the backend
        if ($this->app['config']->getWhichEnd() == 'backend') {
            $this->app['htmlsnippets'] = true;
        }
    }

    /**
     * initialize: initializes the extension
     */
    public function initialize()
    {
        if ($this->app['config']->getWhichEnd() == 'backend') {
            $this->addCss('assets/commenting-ext.css');
            $this->addJavascript('assets/commenting-ext.js', true);
        }
    }

    /**
     * getName: returns the extension name.
     * @return string, extension name.
     */
    public function getName()
    {
        return "commenting";
    }
}
