(function() {
	"use strict";
	// Scene and WebGL setup.
	var renderer;
	if (!window.WebGLRenderingContext) {
		renderer = new THREE.CanvasRenderer();
	} else {
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
	}
	var scene = new THREE.Scene();
	
	// Camera stuff.
	var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	camera.position.z = 5;
	var light = new THREE.DirectionalLight(0xFFFFFF);
	scene.add(light);
	scene.add(new THREE.AmbientLight(0x202020));
	
	// Editor window.
	var editWindow = document.createElement("div");
	var pluginSelect = document.createElement("select");
	jQuery(pluginSelect).appendTo(editWindow);
	var pluginContainer = document.createElement("div");
	jQuery(pluginContainer).appendTo(editWindow);

	// Plugin registry.
	var plugins = {};
	var currentPlugin = null;
	
	// Our 3d Object
	var mesh = new THREE.Mesh();
	
	// Private methods collection.
	var asmt = {
		private: {
			createGlScene: function() {
				// Setup the controls
				var controls = new THREE.EditorControls(camera, renderer.domElement);
				
				// Everything aspect and size related.
				asmt.public.resize();
				window.onresize = asmt.public.resize;
				
				// Dummy cube
				var geometry = new THREE.CubeGeometry(1,1,1);
				var material = new THREE.MeshPhongMaterial({color: 0xffffff});
				asmt.public.setMesh(new THREE.Mesh(geometry, material));
				
				// Render loop
				var render = function () {
					requestAnimationFrame(render);
					if (controls.update != undefined) {
						controls.update();	
					}
					light.position = camera.position;
					renderer.render(scene, camera);
				};
				render();
			},
			
			createEditWindow: function() {
				// Show editor window.
				jQuery(editWindow).appendTo("body").dialog({
					closeOnEscape: false,
					position: [10, 10],
					title: document.title,
					width: 500
				});
				
				// Select box with plugins.
				for (var plugin in plugins) {
					var pluginOption = document.createElement("option");
					if (jQuery(pluginSelect).children().length == 0) {
						jQuery(pluginOption).attr("selected", "selected");
					}
					jQuery(pluginOption).html(plugin).appendTo(pluginSelect);
				}
				jQuery(pluginSelect).change(function() {
					asmt.private.switchPlugin(this.value);
				}).change();
			},
			
			switchPlugin: function(pluginName) {
				if (currentPlugin != null) {
					currentPlugin.close();
				}
				jQuery(pluginContainer).html("");
				currentPlugin = plugins[pluginName];
				currentPlugin.open(pluginContainer);
			}
		},
		
		public: {
			create: function() {
				// Do not initialize if we are already initialized.
				if (renderer.domElement.parentNode) {
					return;
				} else {
					document.body.appendChild(renderer.domElement);
				}
				
				asmt.private.createGlScene();
				asmt.private.createEditWindow();
			},
			
			resize: function() {
				renderer.setSize(window.innerWidth, window.innerHeight);
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
			},
			
			registerPlugin: function(plugin) {
				plugins[plugin.name] = plugin;
			},
			
			setMesh: function(meshParam) {
				scene.remove(mesh);
				mesh = meshParam;
				scene.add(mesh);
			},
			
			getMesh: function() {
				return mesh;
			},
			
			getScene: function() {
				return scene;
			}
		}
	};
	
	window.asmt = asmt.public;
})();
