/*ScruncherSettings Mappings=",MO_EMBED=MO_E" LineCompacting="no" EscapeLevel="1" CharsToEscape="\"\\" CodeLinePrefix="\t\"" CodeLineSuffix="\""*/

/*Scruncher:Leave Next Comment*/
/**********
     TITLE: Scripting Interface Mimic - Host Finder Code
   VERSION: 1.0.6
    AUTHOR: Chris van Rensburg, Sean Echevarria
 COPYRIGHT: 1996-2001 Beatnik, Inc. All Rights Reserved
**********/

/*Scruncher:Leave Next Comment*/
/***

The code in this module should be repeatedly evaluated by all browser windows until the code returns a result indicating that a match has been found. The actual code that is passed should be dynamically generated by substituting appropriate values for the 'SUBSTITUTE[]' blocks in the structure.

SUBSTITUTE[WINDOWREF] = value of the EMBED tag's WINDOWREF attribute
SUBSTITUTE[ID] = value of the EMBED tag's ID attribute

return codes have the following meaning...

0: no match found
	- next steps:
		1] check all other windows
		2] if no match found in any windows, wait until next call from browser's event loop to repeat matching
1: match found, but common support code has not been pushed in
	- next steps:
		1] push in support code
		2] initialize instance
2: match found, and common support code has already been pushed in
	- next step: initialize instance

***/

try {SUBSTITUTE[WINDOWREF]SUBSTITUTE[ID]; (typeof SUBSTITUTE[WINDOWREF]mo_EMBED_initializeInstance != 'undefined') ? 2 : 1} catch (_error) {0}

/*Scruncher:Leave Next Comment*/
/**********
     TITLE: Scripting Interface Mimic - Support Code
   VERSION: 1.0.6
    AUTHOR: Chris van Rensburg, Sean Echevarria
 COPYRIGHT: 1996-2001 Beatnik, Inc. All Rights Reserved
**********/

/*Scruncher:Leave Next Comment*/
/***

The code in this module should be evaluated by the window that contains the matching EMBED instance, in order to push in the support code for the Scripting Interface Mimic. The actual code that is passed should be dynamically generated by substituting appropriate values for the 'SUBSTITUTE[]' blocks in the structure.

SUBSTITUTE[WINDOWREF] = value of the EMBED tag's WINDOWREF attribute

return codes have the following meaning...

1: indicates that the support code was correctly and completely parsed by the JavaScript interpreter
'' (null string): indicates that there was a failure in setting up the document with the support code

***/

MO_EMBED_supportCode = function () {
	window.MO_EMBED_getQueuedTasks = function () {
		var _queuedTasks = this._queuedTasks;
		this._queuedTasks = '';
		return _queuedTasks;
	};

	window.MO_EMBED_queueTask = function (_taskName) {
		var
			_this = this,
			_args = arguments,
			_argValue
		;
		_this._queuedTasks += _taskName;
		for (var _argNo = 1; _argNo < _args.length - 1; _argNo += 2) {
			if (typeof _args [_argNo + 1] != 'undefined') {
				_argValue = _args [_argNo + 1];
				_this._queuedTasks += ((_argNo == 1) ? '?' : '&') + _args [_argNo] + '=' + ((typeof _argValue == 'string') ? escape (_argValue).replace (new RegExp ('\\+','g'),'%2B').replace (new RegExp ('\\.','g'),'%2E').replace (new RegExp ('/','g'),'%2F') : _argValue);
			}
		}
		_this._queuedTasks += ';';
	};

	window.MO_EMBED_getController = function (_channelNo,_controllerNo) {
		var _channelControllers = this.channels [_channelNo].controllers;
		return (typeof _channelControllers [_controllerNo] != 'undefined') ? _channelControllers [_controllerNo] : 0;
	};

	window.MO_EMBED_getChannelMute = function (_channelNo) {return this.channels [_channelNo].mute};
	window.MO_EMBED_getChannelSolo = function (_channelNo) {return this.channels [_channelNo].solo};
	window.MO_EMBED_getProgram = function (_channelNo) {return this.channels [_channelNo].program};
	window.MO_EMBED_getTrackMute = function (_trackNo) {return this.tracks [_trackNo].mute};
	window.MO_EMBED_getTrackSolo = function (_trackNo) {return this.tracks [_trackNo].solo};
	window.MO_EMBED_getTransposable = function (_channelNo) {return this.channels [_channelNo].transposable};

	window.MO_EMBED_noteOn = function (_param1,_param2,_param3,_param4,_param5) {
		if (typeof _param4 == 'undefined')
			this._queueTask ('noteOn','channel',_param1,'note',_param2,'velocity',_param3);
		else
			this._queueTask ('noteOn','channel',_param1,'bank',_param2,'program',_param3,'note',_param4,'velocity',_param5);
	};

	window.MO_EMBED_play = function (_param1,_param2) {
		this._queueTask ('play',(typeof _param1 == 'boolean') ? 'loop' : 'count',_param1,'url',_param2);
	};

	window.MO_EMBED_getInfo = function (_infoField) {
		var _infoFieldLower = _infoField.toLowerCase ();
		return (typeof this.songInfo [_infoFieldLower] != 'undefined') ? this.songInfo [_infoFieldLower] : '';
	};

	window.MO_EMBED_getPosition = function () {
		return this._position + ((this.playing && this._recorded != 0) ? ((new Date ()).getTime () - this._recorded) : 0);
	};

	window.MO_EMBED_setProgram = function (_param1,_param2,_param3) {
		if (typeof _param3 != 'undefined')
			this._queueTask ('setProgram','channel',_param1,'bank',_param2,'program',_param3);
		else
			this._queueTask ('setProgram','channel',_param1,'program',_param2);
	};

	window.MO_EMBED_recordPosition = function (_position) {
		this._position = _position;
		this._recorded = (new Date ()).getTime ();
	};

	window.MO_EMBED_createControlFunction = function (_methodName) {
		var
			_args = MO_EMBED_createControlFunction.arguments,
			_params1 = _params2 = ''
		;
		for (_paramNo = 1; _paramNo < _args.length; _paramNo++) {
			_params1 += ',"' + _args [_paramNo] + '",' + _args [_paramNo];
			_params2 += ((_params2 != '') ? ',' : '') + _args [_paramNo];
		}
		eval ('window.mo_EMBED_' + _methodName + ' = function (' + _params2 + ') {this.queueTask ("' + _methodName + '"' + _params1 + ')}');
	};

	window.MO_EMBED_createQueryFunction = function (_propertyName,_methodPrefix) {
		eval ('window.mo_EMBED_' + ((typeof _methodPrefix == 'string') ? _methodPrefix : 'get') + _propertyName.charAt (0).toUpperCase () + _propertyName.substr (1) + ' = function () {return this.' + _propertyName + '}');
	};

	/*** Add Support Functions for Simple "Pass Through" Methods ***/

	MO_EMBED_createControlFunction ('doMenuItem','item');
	MO_EMBED_createControlFunction ('enableCallbacks','enable');
	MO_EMBED_createControlFunction ('enableMetaEvents','enable');
	MO_EMBED_createControlFunction ('engageAudio','engage');
	MO_EMBED_createControlFunction ('noteOff','channel','note','velocity');
	MO_EMBED_createControlFunction ('pause');
	MO_EMBED_createControlFunction ('setAudioDevicePriority','audioDevicePriority');
	MO_EMBED_createControlFunction ('setAutostart','autostart');
	MO_EMBED_createControlFunction ('setChannelMute','channel','mute');
	MO_EMBED_createControlFunction ('setChannelSolo','channel','solo');
	MO_EMBED_createControlFunction ('setController','channel','controller','value');
	MO_EMBED_createControlFunction ('setEndTime','position');
	MO_EMBED_createControlFunction ('setGlobalMute','mute');
	MO_EMBED_createControlFunction ('setLoop','loop');
	MO_EMBED_createControlFunction ('setPanelDisplay','display');
	MO_EMBED_createControlFunction ('setPanelMode','mode');
	MO_EMBED_createControlFunction ('setPosition','position');
	MO_EMBED_createControlFunction ('setReverbType','reverb');
	MO_EMBED_createControlFunction ('setStartTime','position');
	MO_EMBED_createControlFunction ('setTempo','tempo');
	MO_EMBED_createControlFunction ('setTrackMute','track','mute');
	MO_EMBED_createControlFunction ('setTrackSolo','track','solo');
	MO_EMBED_createControlFunction ('setTransposable','channel','transposable');
	MO_EMBED_createControlFunction ('setTranspose','intervals');
	MO_EMBED_createControlFunction ('setVolume','volume');
	MO_EMBED_createControlFunction ('stop','fade');

	/*** Add Support Functions for Simple State Querying Methods ***/

	MO_EMBED_createQueryFunction ('audioDevicePriority');
	MO_EMBED_createQueryFunction ('audioDeviceShared','is');
	MO_EMBED_createQueryFunction ('audioEngaged','is');
	MO_EMBED_createQueryFunction ('audioSupported','is');
	MO_EMBED_createQueryFunction ('autostart');
	MO_EMBED_createQueryFunction ('fileSize');
	MO_EMBED_createQueryFunction ('loop');
	MO_EMBED_createQueryFunction ('panelDisplay');
	MO_EMBED_createQueryFunction ('panelMode');
	MO_EMBED_createQueryFunction ('paused','Is');
	MO_EMBED_createQueryFunction ('playing','Is');
	MO_EMBED_createQueryFunction ('playLength');
	MO_EMBED_createQueryFunction ('reverbType');
	MO_EMBED_createQueryFunction ('tempo');
	MO_EMBED_createQueryFunction ('transpose');
	MO_EMBED_createQueryFunction ('version');

	/*** EMBED Instance Initializer ***/

	window.mo_EMBED_initializeInstance = function (_this) {
		/*** TIE Manager Methods ***/

		_this.getQueuedTasks = MO_EMBED_getQueuedTasks;
		_this.recordPosition = MO_EMBED_recordPosition;

		/*** Wiring Explicit Implementation Public Methods ***/

		_this.getChannelMute = MO_EMBED_getChannelMute;
		_this.getChannelSolo = MO_EMBED_getChannelSolo;
		_this.getController = MO_EMBED_getController;
		_this.getInfo = MO_EMBED_getInfo;
		_this.getPosition = MO_EMBED_getPosition;
		_this.getProgram = MO_EMBED_getProgram;
		_this.getTrackMute = MO_EMBED_getTrackMute;
		_this.getTrackSolo = MO_EMBED_getTrackSolo;
		_this.getTransposable = MO_EMBED_getTransposable;
		_this.noteOn = MO_EMBED_noteOn;
		_this.play = MO_EMBED_play;
		_this.setProgram = MO_EMBED_setProgram;

		/*** Wiring Dynamically Generated Public Methods ***/

			/*** Control Methods ***/

			_this.doMenuItem = mo_EMBED_doMenuItem;
			_this.enableCallbacks = mo_EMBED_enableCallbacks;
			_this.enableMetaEvents = mo_EMBED_enableMetaEvents;
			_this.engageAudio = mo_EMBED_engageAudio;
			_this.noteOff = mo_EMBED_noteOff;
			_this.pause = mo_EMBED_pause;
			_this.setAudioDevicePriority = mo_EMBED_setAudioDevicePriority;
			_this.setAutostart = mo_EMBED_setAutostart;
			_this.setChannelMute = mo_EMBED_setChannelMute;
			_this.setChannelSolo = mo_EMBED_setChannelSolo;
			_this.setChannelSolo = mo_EMBED_setChannelSolo;
			_this.setController = mo_EMBED_setController;
			_this.setEndTime = mo_EMBED_setEndTime;
			_this.setGlobalMute = mo_EMBED_setGlobalMute;
			_this.setLoop = mo_EMBED_setLoop;
			_this.setPanelDisplay = mo_EMBED_setPanelDisplay;
			_this.setPanelMode = mo_EMBED_setPanelMode;
			_this.setPosition = mo_EMBED_setPosition;
			_this.setReverbType = mo_EMBED_setReverbType;
			_this.setStartTime = mo_EMBED_setStartTime;
			_this.setTempo = mo_EMBED_setTempo;
			_this.setTrackMute = mo_EMBED_setTrackMute;
			_this.setTrackSolo = mo_EMBED_setTrackSolo;
			_this.setTransposable = mo_EMBED_setTransposable;
			_this.setTranspose = mo_EMBED_setTranspose;
			_this.setVolume = mo_EMBED_setVolume;
			_this.stop = mo_EMBED_stop;

			/*** Query Methods ***/

			_this.getAudioDevicePriority = mo_EMBED_getAudioDevicePriority;
			_this.isAudioDeviceShared = mo_EMBED_isAudioDeviceShared;
			_this.isAudioEngaged = mo_EMBED_isAudioEngaged;
			_this.isAudioSupported = mo_EMBED_isAudioSupported;
			_this.getAutostart = mo_EMBED_getAutostart;
			_this.getFileSize = mo_EMBED_getFileSize;
			_this.getLoop = mo_EMBED_getLoop;
			_this.getPanelDisplay = mo_EMBED_getPanelDisplay;
			_this.getPanelMode = mo_EMBED_getPanelMode;
			_this.IsPaused = mo_EMBED_IsPaused;
			_this.IsPlaying = mo_EMBED_IsPlaying;
			_this.getPlayLength = mo_EMBED_getPlayLength;
			_this.getReverbType = mo_EMBED_getReverbType;
			_this.getTempo = mo_EMBED_getTempo;
			_this.getTranspose = mo_EMBED_getTranspose;
			_this.getVersion = mo_EMBED_getVersion;

		/*** Private Methods ***/
		_this._queueTask = _this.queueTask = MO_EMBED_queueTask;

		/*** Private Properties ***/
		_this._queuedTasks = '';
		_this._position = _this._recorded = 0;

		/*** Instance State Properties (returned by query methods, updated in state updates) ***/
		
		_this.autostart = _this.loop = _this.playing = _this.paused = _this.ready = false;
		_this.playLength = _this.tempo = _this.fileSize = _this.reverbType = _this.volume = _this.transpose = _this.startTime = _this.endTime = 0;
		_this.version = _this.panelMode = _this.panelDisplay = '';
		_this.songInfo = new Object ();
		_this.channels = new Array ();
		for (var _channelNo = 1; _channelNo <= 16; _channelNo++) {
			_this.channels [_channelNo] = {
				mute:false,
				solo:false,
				transposable:false,
				program:0,
				controllers:{}
			}
		}
		_this.tracks = new Array ();
		for (var _trackNo = 1; _trackNo <= 64; _trackNo++) {
			_this.tracks [_trackNo] = {
				mute:false,
				solo:false
			}
		}
		/*** Public Properties ***/
		_this.scriptable = true;

		return (1); // 1 is enclosed in parentheses because of a bug in the scruncher code
	};
}.toString ();


SUBSTITUTE[WINDOWREF]eval (MO_EMBED_supportCode.substring (MO_EMBED_supportCode.indexOf ('{') + 1,MO_EMBED_supportCode.lastIndexOf ('}')));

1;

/*Scruncher:Leave Next Comment*/
/**********
     TITLE: Scripting Interface Mimic - Instance Initializer Code
   VERSION: 1.0.6
    AUTHOR: Chris van Rensburg, Sean Echevarria
 COPYRIGHT: 1996-2001 Beatnik, Inc. All Rights Reserved
**********/

/*Scruncher:Leave Next Comment*/
/***

The code in this module should be evaluated by the window that contains the matching EMBED instance, in order to initialize the EMBED instance with the SIM (Scripting Interface Mimic). The actual code that is passed should be dynamically generated by substituting appropriate values for the 'SUBSTITUTE[]' blocks in the structure.

SUBSTITUTE[WINDOWREF] = value of the EMBED tag's WINDOWREF attribute
SUBSTITUTE[ID] = value of the EMBED tag's ID attribute

return codes have the following meaning...

0: error, instance (or window containing it) may have died
1: no error, instance was successfully initialized

***/

try {SUBSTITUTE[WINDOWREF]mo_EMBED_initializeInstance (SUBSTITUTE[WINDOWREF]SUBSTITUTE[ID])} catch (_error) {0}

/*Scruncher:Leave Next Comment*/
/**********
     TITLE: Scripting Interface Mimic - Task Interchange Event Code
   VERSION: 1.0.6
    AUTHOR: Chris van Rensburg, Sean Echevarria
 COPYRIGHT: 1996-2001 Beatnik, Inc. All Rights Reserved
**********/

/*Scruncher:Leave Next Comment*/
/***

The code in this module should be evaluated by the window that contains the matching EMBED instance, in order to perform a task interchange with the EMBED instance. The actual code that is passed should be dynamically generated by substituting appropriate values for the 'SUBSTITUTE[]' blocks in the structure.

SUBSTITUTE[WINDOWREF] = value of the EMBED tag's WINDOWREF attribute
SUBSTITUTE[ID] = value of the EMBED tag's ID attribute
SUBSTITUTE[statusUpdateCode] = a block of code, containing all the tasks that should be performed for the EMBED instance (ie. status update, callback execution). This code does not need to be passed to an eval function in the host document, so the code does not need to be passed as a string parameter and, consequently, the code only needs to be well-formed JavaScript code and no additional escaping of quote or backslash characters is required.

return codes have the following meaning...

'ERROR': error, instance (or window containing it) may have died
[any other value]: list of tasks to be executed by plug-in

***/

try {with (SUBSTITUTE[WINDOWREF]SUBSTITUTE[ID]) {SUBSTITUTE[statusUpdateCode] getQueuedTasks ()}} catch (_error) {'ERROR'}
