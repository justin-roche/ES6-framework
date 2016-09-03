 //no need for IIFE, let vars inside block are local
{

	/*The goal is to be a hierarchical model-adapter-view framework
	control is downward-directed, via named event functions on the controller
	the default scope for these events for child controllers is full access

	initialization is explicit and of the order Model -> Controller -> View

	each next component in this chain receives the previous as an argument*/

	let m = new esf.Model({

	});

	//M, V, and C are classes with instances configured with configuration objects 

	let c = new esf.Controller({
		model: m,

		events: {

			refresh(){
				console.log('refresh');

				//HTTP request calls a mock-up of a server using promises
				esf.HTTPRequest({type: 'GET'}).then((d)=>{
					this.model.$fill(d);	//$prefix means it initiates a propagating model change
											//this is a non-optimistic view update, called after the server call
											//fill is a complete model update that results in complete view refresh
				});
				
			},

			select(model){
				console.log('select');
				this.model.setCursor(model);	//set and get for non-propagating model data
			},

			add(){
				console.log('add');
				let message = $('input').val(); 
				esf.HTTPRequest({type: 'POST', message: message}).then((d)=>{
		
				}); 
				//delete and add are partial updates, they propagate a "difference" which does not result in full view refreshes
				this.model.$add({message: message});
			},

			remove(){
				let m = this.model.getCursor();
				if(m!==false){						
					esf.HTTPRequest({type: 'DELETE', id: m._id}).then((d)=>{
											
					}); 
					this.model.$delete(m);	
				}
				
			},

		}

	}); 

	let v = new esf.View({

		controller: c,
		
		parentElement: '#todos',			//parent element as a string

		template: function(){return `<ul class="list-group">new list group</ul>`},

	});

	c.setRepeat({							//repeat configures the compilation phase of a repeater, which adds new controllers, such as for li elements

			model:  {},

			controller:  {
				
				events: {
					//_ suffice used for shadowed parentEvents
					select_: function(){
						this.parentController.events.select(this.model.data);
						this.view.$el.toggleClass('active');
					},
				
				},
			},
	
			view:  {

				template: function(){return `<li class="list-group-item"><p>${this.state.message}</p></li>`}, 

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
	




