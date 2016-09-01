{

	class Controller{					

		constructor({model, parentController, events, repeat}){

			this.model = null; 
			this.repeat = null; 
			this.view = null; 

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

		setRepeat({model, controller, view}){
			
			this.repeat = function(){

				for(let d of this.model.data){

					var m = new esf.Model(model);
				
					var controllerOpts = controller; 
				
					controllerOpts.parentController = this; 
					controllerOpts.model = m;	
				
					var c = new esf.Controller(controllerOpts);
				
					let viewOpts = view; 

					viewOpts.controller = c; 

					viewOpts.parentElement = this.view.$el; 

					var v = new esf.View(viewOpts);
				
					m.$fill(d);		
				}
			}
		}

		onModelChange(){
			this.view.state = this.model.data; 
			this.view.onStateChange();
			if(this.repeat){
				this.repeat();
			}
		}
				
	}

	esf.Controller = Controller;

}
