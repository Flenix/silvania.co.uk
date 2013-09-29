(function() {
	"use strict";
	
	var objFromMesh = function(mesh) {
		var obj = [];
		obj.push("g MyObjName");
		
		var vertices = [];
		for (var i = 0; i < mesh.geometry.vertices.length; i++) {
			var vertice = mesh.geometry.vertices[i];
			vertices.push("v " + vertice.x + " " + vertice.y + " " + vertice.z);
		}
		obj.push(vertices.join("\n"));

		var uvs = [];
		for (var i = 0; i < mesh.geometry.faceVertexUvs[0].length; i++) {
			for (var j = 0; j < mesh.geometry.faceVertexUvs[0][i].length; j++) {
				var uv = mesh.geometry.faceVertexUvs[0][i][j];
				uvs.push("vt " + uv.x + " " + uv.y);
			}
		}
		console.log(mesh.geometry.faceVertexUvs[0]);
		obj.push(uvs.join("\n"));
		
		var faces = [];
		var uvOffset = 1;
		for (var i = 0; i < mesh.geometry.faces.length; i++) {
			var face = mesh.geometry.faces[i];
			if (face.d == undefined) {
				faces.push("f " +
					(face.a + 1) + "/" + uvOffset++ + " " +
					(face.b + 1) + "/" + uvOffset++ + " " +
					(face.c + 1) + "/" + uvOffset++
				);
			} else {
				faces.push("f " +
					(face.a + 1) + "/" + uvOffset++ + " " +
					(face.b + 1) + "/" + uvOffset++ + " " +
					(face.c + 1) + "/" + uvOffset++ + " " +
					(face.d + 1) + "/" + uvOffset++
				);
			}
		}
		obj.push(faces.join("\n"));
		
		return obj.join("\n\n") + "\n";
	};
	
	var meshFromObj = function(objString) {
		var geometry = new THREE.Geometry();

		var objFile = objString.split(/[\r\n]+/);
		var obj = {v: [], vt: [], f: []};
		for (var i = 0; i < objFile.length; i++) {
			var line = objFile[i];
			if (line.substr(0, 2) == "v ") {
				obj.v.push(line.substr(2).trim().split(/\s+/));
			} else if (line.substr(0, 3) == "vt ") {
				obj.vt.push(line.substr(3).trim().split(/\s+/));
			} else if (line.substr(0, 2) == "f ") {
				var entries = line.substr(2).trim().split(/\s+/);
				obj.f.push(function() {
					var vvt = [];
					for (var j = 0; j < entries.length; j++) {
						vvt.push([entries[j].split("/")[0] - 1, entries[j].split("/")[1] - 1]);
					}
					return vvt;
				}());
			}
		}
		
		for (var fIndex = 0; fIndex < obj.f.length; fIndex++) {
			var f = obj.f[fIndex];
			
			// Add vertices with uv coords to the geometry.
			var uvs = [];
			for (var vvtIndex = 0; vvtIndex < f.length; vvtIndex++) {
				var vvt = f[vvtIndex];
				geometry.vertices.push(new THREE.Vector3(
					parseFloat(obj.v[vvt[0]][0]),
					parseFloat(obj.v[vvt[0]][1]),
					parseFloat(obj.v[vvt[0]][2])
				));
				uvs.push(new THREE.Vector2(obj.vt[vvt[1]][0], obj.vt[vvt[1]][1]));
			}
			geometry.faceVertexUvs[0].push(uvs);
			
			// Add face to the geometry.
			var index = geometry.vertices.length - 1;
			geometry.faces.push(function() {
				if (f.length) {
					return new THREE.Face4(index - 3, index - 2, index - 1, index);
				} else {
					return new THREE.Face3(index - 2, index - 1, index);
				}
			}());
		}
		
		// Optimize geometry.
		geometry.mergeVertices();
		geometry.computeFaceNormals();
		geometry.computeBoundingSphere();

		return new THREE.Mesh(geometry, window.asmt.getMesh().material);
	};
	
	window.asmt.registerPlugin({
		name: "Wavefront .obj",
		
		open: function(container) {
			var textarea = document.createElement("textarea");
			jQuery(textarea).css({
				minHeight: "100px",
				width: "100%"
			}).appendTo(container).val(objFromMesh(window.asmt.getMesh())).keyup(function() {
				window.asmt.setMesh(meshFromObj(textarea.value));
			});
		},
		
		close: function() {
		}
	});
})();
