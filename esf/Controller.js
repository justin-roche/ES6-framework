{

	class Controller{					

		constructor({model, parentController, events, repeat}){

			this.model = null; 
			this.repeat = null; 
			this.view = null; 
			this.repeated = [];						//an array that holds dynamically created elements, like <li> controllers

			if(model){
				this.model = model;
				model.register(this);
			}

			if(events){
				this.events = {};
				for (let event in events){
					this.events[event] = events[event].bind(this);
				}

			}

			if(parentController){
				this.parentController = parentController; 
			}
			 
		}

		register(obj){
			
			if(obj.constructor.name === 'View'){
				this.view = obj; 
			}
			
		}

		remove(){	//removes model and view
			this.view.remove();
			this.view = null;
			return this.model; 
		}


		setRepeat({model, controller, view}){
			
			this.repeat = function(data){

				for(let d of data){

					var m = new esf.Model(model);
				
					var controllerOpts = controller; 
					controllerOpts.parentController = this; 
					controllerOpts.model = m;	
					var c = new esf.Controller(controllerOpts);
					
					let viewOpts = view; 
					viewOpts.controller = c; 
					viewOpts.parentElement = this.view.$el; 		//the link to the repeaters view
					var v = new esf.View(viewOpts);
				
					m.$fill(d);	
					this.repeated.push(c);	
				}
			}

			this.unrepeat = function(data){

				for(let d of data){
					this.repeated.forEach((c,i)=>{
						if(this.model.isEqual(d,c.model.data)){		//derived model comparison uses the parent model's isEqual function, and directly access child model.data
							c.remove();								//how to implement downward control-flow for model equality? 
							this.repeated.splice(i,1);
						}
					});
				}
			}
			
		}

		updateView(){
			this.view.state = this.model.data; 					   //the model is the controller model, the view model is called "state"
			this.view.onStateChange();		  
		}

		onModelFill(){
			this.updateView();
			if(this.repeat){
				this.repeat(this.model.data);						//the repeat function should not access model object, parameter passing w/in class
			}
		}

		onModelAdd(){
			if(!this.repeat) this.updateView();
			if(this.repeat)this.repeat(this.model.difference);
		}
		
		onModelDelete(){
			if(!this.repeat) this.updateView();						//the view model is not the model for the repeated elements
			if(this.repeat) this.unrepeat(this.model.difference);
		}

		

	}

	esf.Controller = Controller;

}
