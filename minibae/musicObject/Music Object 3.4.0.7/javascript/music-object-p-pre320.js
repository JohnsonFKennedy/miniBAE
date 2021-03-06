/**********
     TITLE: Music Object Patch - Pre 3.2.0
   VERSION: 1.1.0
    AUTHOR: Chris van Rensburg
 COPYRIGHT: 1996-2001 Beatnik, Inc. All Rights Reserved
  REQUIRES: music-object.js (3.2.0 or higher)
**********/
function mo_debug(_a,_b,_c){var _d='\n**** DEBUG MESSAGE ****\n    '+_a+((typeof _c=='number')?('\n    LINE# '+_c):'')+'\n    FILE: '+((typeof _b!='string')?window.location.href:_b)+'\n';if(Music.debugToJavaConsole&&typeof java!='undefined')java.lang.System.out.println(_d);if(Music.debugToAlert)alert(_d);if(Music.debugToStatus)window.defaultStatus=_d;return true;}function MO_p2_a(_e){_e.onerror=mo_debug;for(var _f=0;_f<_e.frames.length;_f++)MO_p2_a(_e.frames[_f]);}MO_p2_a(top);if(typeof Music!='undefined'){Music.debugToJavaConsole=true;Music.debugToAlert=false;Music.debugToStatus=true;}mo_addInstanceMethods('engageAudio','getReverbType','setGlobalMute','setReverbType');