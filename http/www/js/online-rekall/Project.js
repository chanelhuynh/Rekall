//ADATPED sans analyse()
/*
    This file is part of Rekall.
    Copyright (C) 2013-2015

    Project Manager: Clarisse Bardiot
    Development & interactive design: Guillaume Jacquemin & Guillaume Marais (http://www.buzzinglight.com)

    This file was written by Guillaume Jacquemin.

    Rekall is a free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function Project(url) {
	this.sources = new Object();
	this.url = url;
	this.firstAnalysis = true;
}

Project.prototype.addDocument = function(key, document) {
	if(this.sources[key] == undefined)
		this.sources[key] = new Source();
	this.sources[key].addDocument(document);
}
Project.prototype.getDocument = function(path) {
	var retour = undefined;
	for (var key in this.sources) {
		if(retour == undefined)
			retour = this.sources[key].getDocument(path);
	}
	return retour;
}

Project.prototype.loadXML = function(xml) {
	this.sources["Files"] = new Source();
	/*
	this.sources["Files"].addMapping("file:///Users/guillaume/Documents/Rekall/Walden/Enregistrements/infinitespaces-test8H264.mov", "file:///Users/guillaume/Documents/Rekall/Walden/Test.txt");
	this.sources["Files"].addMapping("file:///Users/guillaume/Documents/Rekall/Walden/Test.txt", "file:///Users/guillaume/Documents/Rekall/Walden/Enregistrements/infinitespaces-test8H264.mov");
	this.sources["Files"].addMapping("file:///Users/guillaume/Documents/Rekall/Walden/Technique/trad auto.doc", "file:///Users/guillaume/Documents/Rekall/Walden/Enregistrements/infinitespaces-test8H264.mov");
	*/
	
	var thiss = this;
	var counts = {documents: 0, tags: 0, metadatas: 0};
	
	xml.find('document').each(function() {
		if(($(this).attr("remove") != undefined) && ($(this).attr("key") != undefined) && ($(this).attr("remove") == "true")) {
			var rekallDoc = thiss.sources["Files"].documents[$(this).attr("key")];
			if(rekallDoc != undefined) {
				for (var tagIndex in rekallDoc.tags)
					rekallDoc.tags[tagIndex].visuel.rect.remove();
				delete rekall.project.sources["Files"].documents[rekallDoc.key];
			}
		}
		else {
			var rekallDoc = new Document();
			counts.documents++;
			counts.tags++;
			$(this).find('meta').each(function() {
				var rekallDocMeta = new Metadata();
				rekallDocMeta.content 	  = $(this).attr('cnt');
				rekallDocMeta.metadataKey = $(this).attr('ctg');
				rekallDoc.setMetadata(rekallDocMeta);
				counts.metadatas++;
			});
			if($(this).attr("key") != undefined)
				rekallDoc.key = $(this).attr("key");
			thiss.addDocument("Files", rekallDoc);
		}
	});
	xml.find('edition').each(function() {
		var key = $(this).attr('key');
		if(thiss.sources["Files"].documents[key] != undefined) {
			var version       = $(this).attr('version');
			var metadataKey   = $(this).attr('metadataKey');
			var metadataValue = $(this).attr('metadataValue');
			thiss.sources["Files"].documents[key].setMetadata(metadataKey, metadataValue, version);
		}
	});
	xml.find('tag').each(function() {
		var key = $(this).attr('key');
		if(thiss.sources["Files"].documents[key] != undefined) {
			var version   = $(this).attr('version');
			var timeStart = parseFloat($(this).attr('timeStart')) + 0.;
			var timeEnd   = parseFloat($(this).attr('timeEnd'))   + 0.;
			for (var index in thiss.sources["Files"].documents[key].tags) {
				thiss.sources["Files"].documents[key].tags[index].setTimeStart(timeStart);
				thiss.sources["Files"].documents[key].tags[index].setTimeEnd(timeEnd);
			}
		}
	});
	var videoUrl = undefined, videoTech = undefined;
	xml.find('video').each(function() {
		videoUrl  = $(this).attr('url');
		videoTech = $(this).attr('tech');
	});
	
	if((videoUrl != "") && (videoUrl != undefined)) {
		var techOrder = ["youtube", "html5", "flash"];
		if((videoTech != "") && (videoTech != undefined))
			techOrder = [videoTech, "html5", "flash"];
		/*
		//rekall.videoPlayer."techOrder": ["youtube", "html5", "flash"], //youtube dailymotion vimeo
		if((videoTech != "") && (videoTech != undefined))
			rekall.videoPlayer.options.techOrder = [videoTech];
		//rekall.videoPlayer.options.techOrder = ['flash', 'html5'];
		*/
		//Video
		if(rekall.videoPlayer == undefined) {
			videojs("video", {
				"controls": true,
				"autoplay": false,
				"preload": 	"auto",
				"loop": 	"false",
				"techOrder": techOrder, //youtube dailymotion vimeo
		/*
				"poster":   "http://video-js.zencoder.com/oceans-clip.png",
				"src": 	 	"https://vimeo.com/45161598",
				"techOrder": [""], "src" : "",
				"techOrder": ["vimeo"], "src" : "",
				"techOrder": ["html5", "flash"], "src": "oceans-clip.mp4",
		*/
				children: {
					controlBar: {
						children: {
							fullscreenToggle: 	false,
						}
					}
				}
				/*
				    PosterImage
				    TextTrackDisplay
				    LoadingSpinner
				    BigPlayButton
				    ControlBar
				        PlayToggle
				        FullscreenToggle
				        CurrentTimeDisplay
				        TimeDivider
				        DurationDisplay
				        RemainingTimeDisplay
				        ProgressControl
				            SeekBar
				              LoadProgressBar
				              PlayProgressBar
				              SeekHandle
				        VolumeControl
				            VolumeBar
				                VolumeLevel
				                VolumeHandle
				        MuteToggle
				*/
			}, function() {
				rekall.videoPlayer = this;
				//rekall.videoPlayer.volume(0);
				//rekall.timeline.play();
				rekall.videoPlayer.src(videoUrl);
				//rekall.videoPlayer.src([{type: "video/mp4", src: "http://video-js.zencoder.com/oceans-clip.mp4"}, {type: "video/webm", src: "http://video-js.zencoder.com/oceans-clip.webm"}, {type: "video/ogg", src: "http://video-js.zencoder.com/oceans-clip.ogv"}]);
				//rekall.videoPlayer.src("http://www.dailymotion.com/video/xxvfw4_guillaume-jacquemin-soiree-di-zain-5-code-s-data-s_creation");
				
				/*
				try {
					var options = {
						optionsAnnotator: {user: {},store: {}},
						optionsVideoJS: {},
						optionsRS: {},
						optionsOVA: {posBigNew:'ul'},
					}
					//Add the div id to annotate by Annotator. In the demo.html the id is "airlock" too.
					var ova = new OpenVideoAnnotation.Annotator($('#video'),options);

					//(optional) Set the configuration for the users
					ova.setCurrentUser($('#username').val());

					$('#username').change(function () {
						ova.setCurrentUser($(this).val());
					});
				}
				catch(err) {
					
				}
				*/

				rekall.videoPlayer.on("durationchange", function(e) {
				});
				rekall.videoPlayer.on("ended", function(e) {
				});
				rekall.videoPlayer.on("error", function(e) {
				});
				rekall.videoPlayer.on("firstplay", function(e) {
				});
				rekall.videoPlayer.on("fullscreenchange", function(e) {
				});
				rekall.videoPlayer.on("loadedalldata", function(e) {
				});
				rekall.videoPlayer.on("loadeddata", function(e) {
				});
				rekall.videoPlayer.on("loadedmetadata", function(e) {
				});
				rekall.videoPlayer.on("loadstart", function(e) {
				});
				rekall.videoPlayer.on("pause", function(e) {
				});
				rekall.videoPlayer.on("play", function(e) {
				});
				rekall.videoPlayer.on("progress", function(e) {
				});
				rekall.videoPlayer.on("seeked", function(e) {
				});
				rekall.videoPlayer.on("seeking", function(e) {
				});
				rekall.videoPlayer.on("timeupdate", function(e) {
					rekall.timeline.update(rekall.videoPlayer.currentTime());
				});
				rekall.videoPlayer.on("volumechange", function(e) {
				});
				rekall.videoPlayer.on("waiting", function(e) {
				});
				rekall.videoPlayer.on("resize", function(e) {
				});
				$(window).trigger("resize");
	
				console.log(counts.documents + " documents analysés, " + counts.metadatas + " métadonnées extraites et " + counts.tags + " tags affichés !");
				rekall.project.analyse();
			});
		}
		else {
			console.log(counts.documents + " documents analysés, " + counts.metadatas + " métadonnées extraites et " + counts.tags + " tags affichés !");
			rekall.project.analyse();
		}
	}
}

Project.prototype.timelineUpdate = function() {
	
}

Project.prototype.analyse = function() {
	$('#flattentimeline').html("<div id='flattentimeline_highlight'></div>");

	//Analyse
	Tags.flattenTimelineTags = [];
	var filtredTags = new Array();
	rekall.sortings["horizontal"].analyseStart();
	rekall.sortings["colors"]    .analyseStart();
	for (var keySource in this.sources) {      
		for (var keyDocument in this.sources[keySource].documents) {
			for (var key in this.sources[keySource].documents[keyDocument].tags) {
				var tag = this.sources[keySource].documents[keyDocument].tags[key];
				rekall.sortings["horizontal"].analyseAdd(tag);
				rekall.sortings["colors"]    .analyseAdd(tag);
				Tags.flattenTimelineTags.push(tag);
			}
		}
	}
	rekall.sortings["horizontal"].analyseEnd();
	rekall.sortings["colors"]    .analyseEnd();
	Tags.flattenTimelineTags.sort(function(a, b) {
		if(a.timeStart < b.timeStart) return -1;
		if(a.timeStart > b.timeStart) return 1;
		return 0;
	});

	//Affichage
	var categories = rekall.sortings["horizontal"].categories;
	if(rekall.sortings["horizontal"].metadataKey == "Time")
		categories = {time: {tags: Tags.flattenTimelineTags}};
	
	//Affectation des couleurs
	for (var key in rekall.sortings["colors"].categories) {
		var colorSortingCategory = rekall.sortings["colors"].categories[key];
		for (var key in colorSortingCategory.tags) {
			var tag = colorSortingCategory.tags[key];
			tag.update(colorSortingCategory.color);
			tag.isSelectable = colorSortingCategory.checked;

			//Analyse de vignettes
			/*
			if(true) {
				var thumbUrl = undefined
				if((tag.getMetadata("File->Thumbnail") != undefined) && (tag.getMetadata("File->Thumbnail") != "")) {
					var thumbUrl = Utils.getPreviewPath(tag);

					if(tag.isVideo())	thumbUrl += "_1.jpg";
					else				thumbUrl +=  ".jpg";
				}
				tag.thumbnail = {url: thumbUrl, tag: tag};

				if(rekall.panner.thumbnails[colorSortingCategory.category] == undefined)
					rekall.panner.thumbnails[colorSortingCategory.category] = {category: colorSortingCategory, thumbnails: [], documents: []};
				rekall.panner.thumbnails[colorSortingCategory.category].thumbnails.push(tag.thumbnail);
			}
			*/
		}
	}

	//Tags / catégories
	var markers = [], captions = [];
	for (var key in categories) {
		$.each(categories[key].tags, function(index, tag) {
			//Marqueurs sur la timeline
			if(tag.isMarker()) {
				markers.push({
					time: 		 tag.getTimeStart(),
					text: 		 tag.getMetadata("Rekall->Name"),
					overlayText: tag.getMetadata("Rekall->Comments"), 
					css: {
						"background-color": tag.color
					},
					markerTipCss: {
						"font-familly": 	"OpenSans",
						"color": 			tag.color,
					}
				});
				captions.push({
					startTime: 	tag.getTimeStart() * 1000,
					endTime: 	(tag.timeStart + max(2, tag.timeEnd - tag.timeStart)) * 1000,
					position:  	"HB",
					data: 	 	tag.getMetadata("Rekall->Name"),
					alignment: 	"C",
					css: {
						"background-color": "black",
						"font-familly": 	"OpenSans",
						"color": 			tag.color,
					}
				});
			}
			
			//Analyse de vignettes
			if(true) {
				var thumbUrl = undefined
				if((tag.getMetadata("File->Thumbnail") != undefined) && (tag.getMetadata("File->Thumbnail") != "")) {
					var thumbUrl = Utils.getPreviewPath(tag);

					if(tag.isVideo())	thumbUrl += "_1.jpg";
					else				thumbUrl +=  ".jpg";
				}
				tag.thumbnail = {url: thumbUrl, tag: tag};
			}
			
			
			if((tag.getMetadata("Rekall->Highlight") != undefined) && (tag.getMetadata("Rekall->Highlight") != "")) {   
			
				//Dom
				$('#flattentimeline_highlight').append(function() {
					var styleColor = "background-color: " + tag.color + ";";
					var textColor = "color: " + tag.color + ";";

					/*var styleColor = "background-image: -webkit-linear-gradient(left, #000 0%, " + tag.color + " 100%);";*/
					var styleColor2 = styleColor;//"background-color: #3EA8B1;";
					var styleImage = "";
					if(tag.thumbnail.url != undefined) {
						styleImage = "background-image: url(" + tag.thumbnail.url + ");";//" opacity: 0.5;";
						/*styleColor += "opacity: 0.25;"; */
					} else styleImage = "background-color: rgba(0,0,0,.9)";

					var icnType = "";
					var tmpType = tag.getMetadata("Rekall->Type");
					if(tmpType.indexOf("application/msword") >=0 ) 		icnType = "background-image:url(css/images/icn-word.png);";
					else if(tmpType.indexOf("application/pdf") >=0 ) 	icnType = "background-image:url(css/images/icn-pdf.png);";
					else if(tmpType.indexOf("application/") >=0 ) 		icnType = "background-image:url(css/images/icn-document.png);";
					else if(tmpType.indexOf("audio/") >=0 ) 			icnType = "background-image:url(css/images/icn-music.png);";
					else if(tmpType.indexOf("image/") >=0 ) 			icnType = "background-image:url(css/images/icn-image.png);";
					else if(tmpType.indexOf("text/x-vcard") >=0 ) 		icnType = "background-image:url(css/images/icn-user.png);";
					else if(tmpType.indexOf("text/") >=0 ) 				icnType = "background-image:url(css/images/icn-document.png);";
					else if(tmpType.indexOf("video/") >=0 ) 			icnType = "background-image:url(css/images/icn-video.png);";
                                    

					var htmlHighlight = ""; 
					htmlHighlight	+=	"<div draggable=true class='flattentimeline_item flattentimeline_highlightitem'>";
					htmlHighlight	+=	"<div class='flattentimeline_type'			style='" + icnType +"' title='" + tmpType + "'></div>";       
					htmlHighlight	+=	"<div class='flattentimeline_image'      	style='" + styleImage + "'></div>"; 
					htmlHighlight 	+=	"<div class='flattentimeline_title' 		title='" + tag.getMetadata("Rekall->Name") + "'>" + tag.getMetadata("Rekall->Name") + "</div>";   
					htmlHighlight 	+=	"<div class='flattentimeline_description'>" + tag.getMetadata("Rekall->Comments") + "</div>"; 
					htmlHighlight 	+= "<div class='flattentimeline_opacifiant' style='" + styleColor2 + "'></div>";  
					htmlHighlight    += "</div>";          
                   
					tag.flattenTimelineDom = $(htmlHighlight); 
					tag.flattenTimelineDom.click(function(event) { 
						tag.openPopupEdit();                
						//tag.openBrowser();
					});
					tag.flattenTimelineDom.on({
						dragstart: function(event) {
				            event.dataTransfer.setData("key", 	  tag.document.key);
				            event.dataTransfer.setData("version", tag.version);
						}
					});  
				
					return tag.flattenTimelineDom;   
				
				});     
			
			} else {    
			
				//Dom
				$('#flattentimeline').append(function() {
					var styleColor = "background-color: " + tag.color + ";";
					var textColor = "color: " + tag.color + ";";

					/*var styleColor = "background-image: -webkit-linear-gradient(left, #000 0%, " + tag.color + " 100%);";*/
					var styleColor2 = styleColor;//"background-color: #3EA8B1;";
					var styleImage = "";
					if(tag.thumbnail.url != undefined) {
						styleImage = "background-image: url(" + tag.thumbnail.url + ");";//" opacity: 0.5;";
						/*styleColor += "opacity: 0.25;"; */
					} else styleImage = "background-color: rgba(0,0,0,.9)";

					var icnType = "";
					var tmpType = tag.getMetadata("Rekall->Type");
					if(tmpType.indexOf("application/msword") >=0 ) 		icnType = "background-image:url(css/images/icn-word.png);";
					else if(tmpType.indexOf("application/pdf") >=0 ) 	icnType = "background-image:url(css/images/icn-pdf.png);";
					else if(tmpType.indexOf("application/") >=0 ) 		icnType = "background-image:url(css/images/icn-document.png);";
					else if(tmpType.indexOf("audio/") >=0 ) 			icnType = "background-image:url(css/images/icn-music.png);";
					else if(tmpType.indexOf("image/") >=0 ) 			icnType = "background-image:url(css/images/icn-image.png);";
					else if(tmpType.indexOf("text/x-vcard") >=0 ) 		icnType = "background-image:url(css/images/icn-user.png);";
					else if(tmpType.indexOf("text/") >=0 ) 				icnType = "background-image:url(css/images/icn-document.png);";
					else if(tmpType.indexOf("video/") >=0 ) 			icnType = "background-image:url(css/images/icn-video.png);";
                                    

					var html = ""; 
					html	+= "<div draggable=true class='flattentimeline_item' title='" + tag.getMetadata("Rekall->Comments") + "'>";  
					html 	+= "<div class='flattentimeline_image'      style='" + styleImage + "'></div>";   
					html 	+= "<div class='flattentimeline_opacifiant' style='" + styleColor2 + "'></div>";                     
					html 	+= "<div class='flattentimeline_type'		style='" + icnType +"' title='" + tmpType + "'></div>";                                                           
					html 	+= "<div class='flattentimeline_title' 		title='" + tag.getMetadata("Rekall->Name") + "'>" + tag.getMetadata("Rekall->Name") + "</div>";     
					html    += "</div>";           
			    
					tag.flattenTimelineDom = $(html); 
					tag.flattenTimelineDom.click(function(event) {                
						tag.openPopupEdit(); 
						//tag.openBrowser();
					});
					tag.flattenTimelineDom.on({
						dragstart: function(event) {
				            event.dataTransfer.setData("key", 	  tag.document.key);
				            event.dataTransfer.setData("version", tag.version);
						}
					});        
				
					return tag.flattenTimelineDom;    
				
				});  
			}
			
			//Ouverture du popup
			if((Tag.keyToOpenAfterLoading != undefined) && (tag.document.key == Tag.keyToOpenAfterLoading)) {
				fillPopupEdit(tag);
				Tag.keyToOpenAfterLoading = undefined;
			}
		});
	}
	rekall.timeline.updateFlattenTimeline();


	//Initialisation des captions
	if(rekall.videoPlayer.caption.updateCaption == undefined) {
		rekall.videoPlayer.caption({
			data: captions, 
			setting: {
				captionSize:  3,
				captionStyle: {
					'background-color': 'rgba(255,0,0,0.8)',
					'color':  			'white',
					'padding': 			'3px',
					'font-family': 		'OpenSans',
				},
				onCaptionChange: function(num_c) {
					//console.log("playing: " + num_c + " caption");
				}
			}
		});
	}
	else
		rekall.videoPlayer.caption.loadNewCaption({data: captions});

	//Ajout des marqueurs sur la timeline
	if(rekall.videoPlayer.markers.removeAll == undefined) {
		rekall.videoPlayer.markers({
			markerStyle: {
				'width':            '7px',
				'border-radius':    '30%',
				'background-color': 'yellow'
			},
			markerTip:{
				display: true,
				text: function(marker) {
					return marker.text;
				},
				time: function(marker) {
					return marker.time;
				}
			},
			breakOverlay:{
				display:     false,
				displayTime: 3,
				style: {
					'width':            '100%',
					'height':           '20%',
					'background-color': 'rgba(0,0,0,0.7)',
					'color':            'white',
					'font-size':        '17px'
				},
				text: function(marker) {
					return "Break overlay: " + marker.overlayText;
				}
			},
			onMarkerClick: 	 function(marker) {},
			onMarkerReached: function(marker) {},
			markers: markers
		});
	}
	else
		rekall.videoPlayer.markers.reset(markers);
}
