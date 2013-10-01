require.config({

  // Specify the amount of seconds before a
  // load timeout for high latency connections or err.type == 'timeout'
  waitSeconds: 200,

  paths: {

    // ----------
    //= Vendor
    // ----------
    'text'                      : '../../vendor/text',
    'jquery'                    : '../../vendor/jquery.js',
    'jquery_timeago'            : '../../vendor/jquery.timeago',
    'jquery_select2'            : '../../vendor/select2/select2',
    'dropzone'                  : '../../vendor/dropzone-amd-module',
    'underscore'                : '../../vendor/underscore',
    'backbone'                  : '../../vendor/backbone',
    'bootstrap'                 : '../../vendor/bootstrap',
    'async'                     : '../../vendor/async/lib/async',

    // ---------
    //= Mixins
    // ---------
    'utilities'                 : '../../backbone/mixins/utilities',
    'popovers'                  : '../../backbone/mixins/popovers',

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
    'marketing_home_template'   : '../apps/marketing/home/templates/marketing_home_template.html',

    // ----------
    //= Projects
    // ----------
    'projects_app'              : '../apps/project/project_app',
    'project_list_controller'   : '../apps/project/list/controllers/project_list_controller',
    'projects_collection_view'  : '../apps/project/list/views/projects_collection_view',
    'projects_show_controller'  : '../apps/project/show/controllers/project_show_controller',
    'project_item_view'         : '../apps/project/show/views/project_item_view',
    'project_show_template'     : '../apps/project/show/templates/project_item_view_template.html',
    'project_tag_template'      : '../apps/project/show/templates/project_tag_item_template.html',
    'project_list_template'     : '../apps/project/list/templates/project_collection_view_template.html',
    'project_model'             : '../entities/projects/project_model',
    'projects_collection'       : '../entities/projects/projects_collection',
    'project_form_view'         : '../apps/project/new/views/project_new_form_view',
    'project_form_template'     : '../apps/project/new/templates/project_new_form_template.html',
    'project_edit_form_template': '../apps/project/edit/templates/project_edit_form_template.html',
    'project_edit_form_view'    : '../apps/project/edit/views/project_edit_form_view',

    // ----------
    //= Tags
    // ----------
    'tag_config'                : '../components/tag',
    'tag_form_view'             : '../apps/tag/new/views/tag_new_form_view',
    'tag_form_template'         : '../apps/tag/new/templates/tag_new_form_template.html',

    // ----------
    //= Tasks
    // ----------
    'task_list_template'        : '../apps/tasks/list/templates/task_collection_view_template.html',
    'task_form_template'        : '../apps/tasks/new/templates/task_form_template.html',
    'tasks_collection'          : '../entities/tasks/tasks_collection', 
    'task_model'                : '../entities/tasks/task_model',
    'task_list_controller'      : '../apps/tasks/list/controllers/task_list_controller',
    'task_collection_view'      : '../apps/tasks/list/views/task_collection_view',
    'task_form_view'            : '../apps/tasks/new/views/task_form_view',

    // ----------
    //= Events
    // ----------
    'event_list_template'        : '../apps/events/list/templates/event_collection_view_template.html',
    'event_form_template'        : '../apps/events/new/templates/event_form_template.html',
    'events_collection'          : '../entities/events/events_collection', 
    'event_model'                : '../entities/events/event_model',
    'event_list_controller'      : '../apps/events/list/controllers/event_list_controller',
    'event_collection_view'      : '../apps/events/list/views/event_collection_view',
    'event_form_view'            : '../apps/events/new/views/event_form_view',

    // ----------
    //= PROFILE
    // ----------
    'profile_app'               : '../apps/profiles/profile_app',
    'profile_model'             : '../entities/profiles/profile_model',
    'profile_show_view'         : '../apps/profiles/show/views/profile_show_view',
    'profile_show_controller'   : '../apps/profiles/show/controllers/profile_show_controller',
    'profile_show_template'     : '../apps/profiles/show/templates/profile_show_template.html',
    
    // ----------
    //= Comments
    // ----------
    'comment_list_controller'   : '../apps/comments/list/controllers/comment_list_controller',
    'comment_list_template'     : '../apps/comments/list/templates/comment_list_template.html',
    'comment_item_template'     : '../apps/comments/list/templates/comment_item_template.html',
    'comment_wrapper_template'  : '../apps/comments/list/templates/comment_wrapper_template.html',
    'comment_list_view'         : '../apps/comments/list/views/comment_list_view',
    'comment_collection'        : '../entities/comments/comment_collection',
    'comment_model'             : '../entities/comments/comment_model',
    'comment_form_view'         : '../apps/comments/new/views/comment_form_view',
    'comment_form_template'     : '../apps/comments/new/templates/comment_form_template.html',
    
    // ----------
    //= Components
    // ----------
    'modal_component'           : '../components/modal',
    'modal_template'            : '../components/modal_template.html',
    'autocomplete'              : '../mixins/autocomplete'
  },

  shim: {
    // Select2 is not an AMD module
    'jquery_select2': {
      exports: 'select2'
    }
  }

});

define([
  'underscore',
  'app'
], function (Application) {
  new Application();
});
