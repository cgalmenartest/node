// Require setup and config
require.config({

  paths: {

    // ----------
    //= Vendor
    // ----------
    'text'                      : '../../vendor/text',
    'jquery'                    : '../../vendor/jquery',
    'dropzone'                  : '../../vendor/dropzone-amd-module',
    'underscore'                : '../../vendor/underscore',
    'backbone'                  : '../../vendor/backbone',
    'bootstrap'                 : '../../vendor/bootstrap',

    // ---------
    //= Mixins
    // ---------
    'utilities'                 : '../../backbone/mixins/utilities',

    // ---------
    //= Core App
    // ---------
    'app'                       : '../app',

    // ---------
    //= Multi-tenant Router
    // ---------
    'apps_router'               : '../../backbone/apps/apps_router',

    // ----------
    //= Base Objects
    // ----------
    'base_controller'           : '../base/base_controller',
    'base_app_module'           : '../base/base_app_module',
    'base_component'            : '../base/base_component',

    // ----------
    //= Home
    // ----------
    'marketing_app'             : '../apps/marketing/marketing_app',
    'marketing_home_controller' : '../apps/marketing/home/controllers/marketing_home_controller',
    'marketing_home_view'       : '../apps/marketing/home/views/marketing_home_view',
    
    // ----------
    //= Projects
    // ----------
    'projects_app'              : '../apps/project/project_app',
    'project_list_controller'   : '../apps/project/list/controllers/project_list_controller',
    'projects_collection_view'  : '../apps/project/list/views/projects_collection_view',

    'projects_show_controller'  : '../apps/project/show/controllers/project_show_controller',
    'project_item_view'         : '../apps/project/show/views/project_item_view',

    // ----------
    //= Entities
    // ----------
    'project_model'             : '../entities/projects/project_model',
    'projects_collection'       : '../entities/projects/projects_collection',
    'tasks_collection'          : '../entities/tasks/tasks_collection',
    'task_model'                : '../entities/tasks/task_model',


    // ----------
    //= Templates
    // ----------
    'project_show_template'     : '../apps/project/show/templates/project_item_view_template.html',
    'project_list_template'     : '../apps/project/list/templates/project_collection_view_template.html',
    'marketing_home_template'   : '../apps/marketing/home/templates/marketing_home_template.html',
    'task_list_template'        : '../apps/tasks/list/templates/task_collection_view_template.html',
    'task_form_template'        : '../apps/tasks/new/templates/task_form_template.html',

    // ----------
    //= Tasks
    // ----------
    'task_list_controller'      : '../apps/tasks/list/controllers/task_list_controller',
    'task_collection_view'      : '../apps/tasks/list/views/task_collection_view',
    'task_form_view'            : '../apps/tasks/new/views/task_form_view',

    // ----------
    //= Components
    // ----------
    'modal_component'           : '../components/modal'
  }

});

define([
  'underscore',
  'app'
], function (Application) {
  
  new Application();

});