{

	//private utility methods here
	let data = null;
	let result = null; 
	let sharedProps = null; 
	let pipe = null; 

	class Model {

		constructor({data, sharedProps, pipe}){
			this.data = null; 

		}

		register(controller){
			this.controller = controller; 
		}

								
		setCursor(model){
			this.cursorModel = model;
		}

		getCursor(){
			return this.cursorModel? this.cursorModel.id : false; 
		}

		//dollar signs indicate mutations that propagate and can have pipes 

		$fill(data){
			this.data = data; 
			this.controller.onModelChange();
		}

		$delete(data){
			if(Array.isArray(data)){
				this.data = this.data.filter(function(d){return d._id!=model._id});
			} else {
				this.data = null; 
			}
			this.controller.onModelChange();
		}

		$add(data){
			this.controller.onModelChange();
		}

	}
	
	esf.Model = Model; 

}