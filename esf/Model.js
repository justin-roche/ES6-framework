{

	//private utility methods here
	let data = null;
	let result = null; 
	let sharedProps = null; 
	let pipe = null; 

	function* createID(startVal) {								//each collection member (data model) gets a unique id
	    let c = startVal; 
	    while(true){
	    	yield c; 
	    	c+=1; 
	    }
	}
	let ids = createID(1000);

	class Model {

		constructor({data, sharedProps, pipes,equality}){
			
			this.data = null; 
			
			this.isEqual = function(dm1, dm2){					//configures how different members of collection determined to be equal
				return dm1.esfID === dm2.esfID;					
			}

			if(!pipes){
				
			}

			if (equality) this.isEqual = equality; 
		}

		register(controller){
			this.controller = controller; 
		}

								
		setCursor(model){
			this.cursorModel = model;
		}

		getCursor(){
			return this.cursorModel? this.cursorModel : false; 
		}

		dataModel(data){									//the data model is the result of any changes applied to the raw data
															//each member of the collection is of type data model
				if(Array.isArray(data)){
				return data.map(function(d){				//conversion to data-model
						d.esfID = ids.next().value;		
						return d; 
					}); 
				}
				else{
					data.esfID = ids.next().value;
					return data;
				}
			}
		

		//dollar signs indicate mutations that propagate and can have pipes 

		$fill(data){									//data is the conventional name for the raw input, which is the contents of the model
			this.data = this.dataModel(data);
			this.controller.onModelFill();
		}

		$delete(deleted){																	
			let filteredData = this.data.filter((d)=>{return !this.isEqual(d,deleted)});		
			if(filteredData.length < this.data.length){
				this.data = filteredData; 
				this.difference = [deleted];			//difference is always of array type
				this.controller.onModelDelete();
			}
		}

		$add(data){
			//would call data-model pipes here, or using defined model proxy

			data = this.dataModel(data);
			this.data.push(data);
			this.difference = this.data.slice(this.data.length-1,this.data.length);			//assumes addition is final position
			this.controller.onModelAdd();													//M,V,and C components do not pass parameters to each others methods
		}

	}
	
	esf.Model = Model; 

}