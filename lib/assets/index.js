/**
 * Module dependencies.
 * @private
 */
var fs   = require( 'fs' );
var yaml = require( 'js-yaml' );
var lib  = require( './lib' );

var source = fs.readFileSync( CONF_DIR + 'assets.yml', 'utf8' );
var config = yaml.load( source );

var version_path = PUB_DIR + 'tmp/assets_version.json';

var cache = {
  css : {},
  js  : {}
};

var asset_host         = config.asset_host;
var asset_host_current = 0;
var asset_host_total, asset_host_counter;

if( Array.isArray( asset_host )){
  asset_host_total   = asset_host.length;
  asset_host_counter = function (){
    asset_host_current = asset_host_current == asset_host_total ?
      0 : asset_host_current += 1;
  };
}else{
  asset_host_total   = 0;
  asset_host_counter = function (){};
}

lib.pub_dir = PUB_DIR;

module.exports = function ( app, callback ){
  var css, js;

  if( NODE_ENV === 'prod' ){
    var version = JSON.parse( fs.readFileSync( version_path, 'utf8' ));

    css = lib.prod_css( config, cache, version, asset_host, asset_host_total, asset_host_current, asset_host_counter );
    js  = lib.prod_js( config, cache, version, asset_host, asset_host_total, asset_host_current, asset_host_counter );
  }else{
    // dev mode
    css = lib.dev_css( config );
    js  = lib.dev_js( config );
  }

  lib.helpers( app ,css, js, callback );
};