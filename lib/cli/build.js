/**
 * Module dependencies.
 * @private
 */
 var fs     = require( 'fs' );
 var path   = require( 'path' );
 var Flow   = require( 'node.flow' );
 var packer = require( 'node.packer' );
 var yaml   = require( 'js-yaml' );
 var rmdir  = require( 'rmdirr' );

  var utils      = require( '../utils' );
  var lib        = require( '../assets/lib' );
  var add_spaces = utils.add_spaces;
  var uid        = utils.uid( 32 );

module.exports = function (){

  utils.is_project_root( function ( current ){
    var source       = fs.readFileSync( current + '/config/assets.yml', 'utf8' );
    var config       = yaml.load( source );
    var version_path = current + '/public/assets_version.json';
    var tmp_dir      = current + '/tmp/assets/';

    lib.pub_dir = current + '/public/';

    var flow = new Flow({
      log    : true,
      minify : true,
      uglify : false
    });

    // check if the dir exist, if it does remove it
    flow.series( function ( args, next ){
      if( !path.existsSync( tmp_dir )) return next();

      rmdir( tmp_dir, function ( err, dirs, files ){
        if( err ) throw err;

        next();
      });
    }).

    // create assets dir
    series( function ( args, next ){
      fs.mkdirSync( tmp_dir );
      next();
    });

    // build assets
    lib.build_assets( config, flow, packer, config.css, 'css', tmp_dir );
    lib.build_assets( config, flow, packer, config.js, 'js', tmp_dir );

    flow.join().end( function (){
      var version, compare;

      if( path.existsSync( version_path )){
        version = JSON.parse( fs.readFileSync( version_path, 'utf8' ));
        compare = true;
      }else{
        version = {
          css : lib.assign_version( config.css, uid ),
          js  : lib.assign_version( config.js, uid )
        };

        fs.writeFileSync( version_path, JSON.stringify( version, null, 2 ));
        compare = false;
      }

      lib.compare_and_replace( fs, config, version.css, 'css', tmp_dir, compare );
      lib.compare_and_replace( fs, config, version.js, 'js', tmp_dir, compare );
    });
  });
};