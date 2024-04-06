var modelList = [];
var models = null;
AFRAME.registerComponent("markerhandler", {
  init: async function() {
    this.el.addEventListener("markerFound", () => {
      var modelName = this.el.getAttribute("model_name");
      var barcodeValue = this.el.getAttribute("value");
      modelList.push({
        model_name: modelName,
        barcode_value: barcodeValue
      });

      this.el.setAttribute("visible", true);
    });

    this.el.addEventListener("markerLost", () => {
      var modelName = this.el.getAttribute("model_name");
      var index = modelList.findIndex(x => x.model_name === modelName);

      if (index > -1) {
        modelList.splice(index, 1);
      }

   
    });
  },
 // a function to find the distance between two vector position
  getDistance: function(a, b){
    return a.object3D.position.distanceTo(b.object3D.position);
  },








 //Write the function isModelPresentInArray()
  isModelPresentInArray: function(array, element){
    return array.includes(element)
  },







  tick: async function() {
    if (modelList.length > 1) {
      var isBaseModelPresent = this.isModelPresentInArray(modelList, "base");
      var messageText = document.querySelector("#message-text");

      if (!isBaseModelPresent) {
        //make the visibility true 
        messageText.setAttribute("visible", true);



      } 
      
      
      else {
        if (models === null) {
          models = await this.getModels();
        }

        messageText.setAttribute("visible", false);
        this.placeTheModel("road", models);
        this.placeTheModel("car", models);
        this.placeTheModel("building1", models);
        this.placeTheModel("building2", models);
        this.placeTheModel("building3", models);
        this.placeTheModel("tree", models);
        this.placeTheModel("sun", models);
      }
    }
  },
  getModels: function() {
    return fetch("js/models.json")
      .then(res => res.json())
      .then(data => data);
  },
  getModelGeometry: function(models, modelName) {
    var barcodes = Object.keys(models);
    for (var barcode of barcodes) {
      if (models[barcode].model_name === modelName) {
        return {
//addd the code here
          position: models[barcode]["placement-position"],
          rotation: models[barcode]["placement-rotation"],
          scale: models[barcode]["placement-scale"],
          model_url: models[barcode]["model_url"]

        };
      }
    }
  },
  placeTheModel: function(modelName, models) {
    var isListContainModel = this.isModelPresentInArray(modelList, modelName);
    if (isListContainModel) {
      var distance = null;
      var marker1 = document.querySelector(`#marker-base`);
      var marker2 = document.querySelector(`#marker-${modelName}`);

      distance = this.getDistance(marker1, marker2);
      if (distance < 1.25) {
        // Add code to Change Model Visibility
        var modelEl = document.querySelector(`#${modelName}`)
        modelEl.setAttribute("visible", false)
       
        var isModelPlaced = document.querySelector(`#model-${modelName}`);
        if (isModelPlaced === null) {
          var el = document.createElement("a-entity");
          var modelGeometry = this.getModelGeometry(models, modelName);
          el.setAttribute("id", `model-${modelName}`);
          el.setAttribute("gltf-model", `url(${modelGeometry.model_url})`);
          el.setAttribute("position", modelGeometry.position);
          el.setAttribute("rotation", modelGeometry.rotation);
          el.setAttribute("scale", modelGeometry.scale);
          marker1.appendChild(el);
        }
      }
    }
  }
});
