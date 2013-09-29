(function() {
	"use strict";
	
	var shapeFromMesh = function(mesh) {
		var shape = [];
		shape.push("BoundingBox: \"0 0 0 1 1 1\"");
		shape.push("Shapes:");
		
		var quads = [];
		for (var f = 0; f < mesh.geometry.faces.length; f++) {
			var face = mesh.geometry.faces[f];
			
			quads.push("  - Texture: 0");
			quads.push("    Coords: |");
			
			for (var v = 0; v < 4; v++) {
				var char = String.fromCharCode(97 + v);
				if (v == 3 && face[char] == undefined) {
					char = "c";
				}
				
				var vertice = mesh.geometry.vertices[face[char]];
				quads.push("      " + vertice.x + " " + vertice.y + " " + vertice.z);
			}
		}
		shape.push(quads.join("\n"));
		
		return shape.join("\n") + "\n";
	};
	
	var meshFromShape = function(shapeString) {
		var geometry = new THREE.Geometry();
		
		var yaml = jsyaml.load(shapeString);
		
		if (yaml.Shapes) {
			for (var i = 0; i < yaml.Shapes.length; i++) {
				var shape = yaml.Shapes[i];
				if (shape.Coords && shape.Coords.trim().match(/^(([0-9\.\-]+\s+){8}|([0-9\.\-]+\s+){11})([0-9\.\-]+)$/)) {
					var coords = shape.Coords.split(/[\s]+/);
					
					// Triangle stuff.
					if (coords.length == 9) {
						coords.push(coords[6], coords[7], coords[8]);
					}
					
					for (var v = 0; v < 4; v++) {
						geometry.vertices.push(new THREE.Vector3(
							parseFloat(coords[0 + v * 3]),
							parseFloat(coords[1 + v * 3]),
							parseFloat(coords[2 + v * 3])
						));
					}
					
					geometry.faceVertexUvs[0].push([
						new THREE.Vector2(1, 1),
						new THREE.Vector2(1, 0),
						new THREE.Vector2(0, 0),
						new THREE.Vector2(0, 1)
					]);
					
					var index = geometry.vertices.length - 1;
					geometry.faces.push(new THREE.Face4(index - 3, index - 2, index - 1, index));
				}
			}
		}
		
		// Optimize geometry.
		geometry.mergeVertices();
		geometry.computeFaceNormals();
		geometry.computeBoundingSphere();
		
		return new THREE.Mesh(geometry, window.asmt.getMesh().material);
	};
	
	window.asmt.registerPlugin({
		name: "MoreMaterials .shape",
		
		open: function(container) {
			var textarea = document.createElement("textarea");
			jQuery(textarea).css({
				minHeight: "100px",
				width: "100%"
			}).appendTo(container).val(shapeFromMesh(window.asmt.getMesh())).keyup(function() {
				window.asmt.setMesh(meshFromShape(textarea.value));
			});
		},
		
		close: function() {
		}
	});
})();
