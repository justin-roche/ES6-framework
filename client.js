 //no need for IIFE, let vars inside block are local
{

	/*The general principle is to be a hierarchical model-adapter-view framework
	control is downward-directed, via named event functions on the controller
	the default scope for these events for child controllers is full access

	initialization is explicit and of the order Model -> Controller -> View

	each next component in this chain receives the previous as an argument
	it then calls the register method on that component, which registers it for the first component*/

	let m = new esf.Model({

	});

	//M, V, and C are classes configured with configuration objects 

	let c = new esf.Controller({
		model: m,

		events: {

			refresh(){
				console.log('refresh');
				esf.HTTPRequest({type: 'GET'}).then((d)=>{
					this.model.$fill(d);	//$prefix means it initiates a propagating model change

				});
				//HTTP request calls a mock-up of a server using promises
			},

			select(model){
				console.log('select');
				this.model.setCursor(model);	//set and get for non-propagating model data
			},

			add(){
				console.log('add');
				esf.HTTPRequest({type: 'POST', message: $('input').val()}).then((d)=>{
						this.model.$fill(d);						
				}); 
			},

			remove(data){
				let t = this.model.getCursor();
				if(t!==false){						//STRICT INEQUALITY IS A THING
					esf.HTTPRequest({type: 'DELETE', id: t}).then((d)=>{
						this.model.$fill(d);						
					}); 
				}
				
			},

		}

	}); 

	let v = new esf.View({

		controller: c,
		
		parentElement: '#todos',			//parent element is as a string

		template: function(){return `<ul class="list-group">new list group</ul>`},

	});

	c.setRepeat({			//repeat configures the compilation phase of a repeater,which adds new controllers

			model:  {},

			controller:  {
				
				events: {
					//_ for shadowed parentEvents
					select_: function(){
						this.parentController.events.select(this.model.data);
						this.view.$el.toggleClass('active');
					},
				
				},
			},
	
			view:  {

				template: function(){return `<li class="list-group-item"><p>${this.state.message}</p></li>`}, //cannot create dynamic template literal

				controllerEvents: {
					select_: [],		//no selector arg means select this.$el
				}
			},

	});

	c.events.refresh();
	//.refresh is the default initializer for api controllers

	let bc = new esf.Controller({
		model: false,
		parentController: c,
	}); 

	let bv = new esf.View({
		controller: bc,
		
		parentElement: '#buttons',

		template: function(){ return `<div><button id='add' style='width:300px; height:300px' class='btn btn-lg btn-primary'></button>
									 <button id ='remove' style='width:300px; height:300px' class='btn btn-lg btn-danger'></button></div>`},
		controllerEvents: {
			add: ['button#add'],
			remove: ['button#remove']
		}
	});

	
	bv.render();


}	
	




