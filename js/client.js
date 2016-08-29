{ //no need for IIFE, let vars inside block are local

	
{
	//unique id creation for server using generator

	function* createID(startVal) {
	    let c = startVal; 
	    while(true){
	    	yield c; 
	    	c+=1; 
	    }
	}

	let data = [{id: 0, message: 'eat icecream'},{id: 1, message: 'party hard'}];
	let ids = createID(data.length);

	//server mock-up using promises

	function HTTPRequest({type: type, id: id, message: message}){

		switch(type){
			case('GET'): {
				return new Promise(
			        function (resolve, reject) {
			            setTimeout(()=> {
							resolve(data);
						},1000);
			        }
	        	);
			};
			case ('DELETE'): {
				return new Promise(
			        function (resolve, reject) {
			            setTimeout(()=>	 {	
								data = data.filter((d)=>{return d.id != id;});
								resolve(data);
						},1000);
			        }
	        	);


			};
			case ('POST'): {
				return new Promise(
			        function (resolve, reject) {
			            setTimeout(()=>	 {	
			            		var newData  = {message: message};
			            		newData.id = ids.next().value;
			            		//ids.next() doesn't return value
								data.push(newData);
								resolve(data);
						},1000);
			        }
	        	);

			}		
		}
	}	
}

	const APIpassword = '42';

	class EventEmitter {							//the even functionality of the controller

		constructor(){
			this.handlers = {};
		}

		on(eventName,fn){
			this.handlers[eventName]? this.handlers[eventName].push(fn): this.handlers[eventName] = [fn];
		}

		broadcast(event){
			if(!this.handlers[event.eventName]){
				throw new Error('unhandled event:' + event.eventName);
			}
			this.handlers[event.eventName].forEach((fn)=>{
				fn(event);
			});
		}

	}


	class Controller extends EventEmitter{					//the registry functionality of the Controller

		constructor(){
			super();
			this.emitters = [];
		}

		listen(...models){									//register the models to be listened to
			for(let m of models){
				m.controller = this; 
				this.emitters.push(m);
				if(!m.register){
					throw new Error('Every component must have a register method');
				}
				m.register();
			}
			return this;
		}

	}

	class Model {

		constructor(){
			this.collection = [];
			this.controller = null; 
			this.view = null; 
			this.targetModel = null; 
			this.transformer = null; 
		}

		update(){
			this._project()
		}

		pipe(targetModel, transformer){					//Model to Model communication
			this._project = function(){
				targetModel.update(this.collection);  	//update on linked model always gets data as parameter
			}
			return targetModel;
		}

		project(view){									//Model to View communication
			this.view = new view();
			
			if(!this.controller){
				throw new Error('every model needs a controller before adding a view');
			}

			this.controller.listen(this.view); 
			this.view.model = this; 

			this._project = function(){				
				this.view.render();						
			}
		}
													//matching for cursor and delete is by reference
		cursor(model){
			this.cursorModel = model;
			let temp = this.collection.indexOf(model);
			this.cursorLoc == temp? this.cursorLoc = null : this.cursorLoc = temp;
		}

		delete(model){
			this.collection = this.collection.filter(function(d){return d!=model});
		}

	}

	class APIModel extends Model{

		constructor(){
			super();
		}

		register(){
			this.controller.on('add',(e)=>{
				this._add(e.message);
			});

			this.controller.on('api.delete',(e)=>{
				this._delete(e.key);
			});
		}

		_update(){
			HTTPRequest({type: 'GET'}).then((d)=>{
				this.update(d);							//Binary Array
			});
		}

		_delete(id){
			HTTPRequest({type: 'DELETE', id: id}).then((d)=>{
				this.update(d); 
			});
		}

		_add(message){
			HTTPRequest({type: 'POST', message: message}).then((d)=>{
				this.update(d); 
			});
		}

		update(d){
			this.collection = d; 	//fullpage refresh
			super.update();
		}

		init(){
			this._update();
		}

	}

	class CollectionModel extends Model{
		
		constructor(){
			super();
			this.collection = []; 	
		}

		register(){
			this.controller.on('select',(e)=>{
				this.cursor(e.model);							
			});

			this.controller.on('delete',(e)=>{
				this.controller.broadcast({eventName: 'api.delete', key: this.cursorModel.collection.id});							
			});		
		}

		update(d) {
			this.collection = d;				           //full data model update
			this._reduce();
			super.update();
		}

		reduce(ModelClass, ViewClass){						//One-to-many model conversion
			this._reduce = function(){
				var temp = this.collection;
				this.collection = [];
				for (let obj of temp){
					let item = new ModelClass(obj);			//each item class gets new data as parameter
					this.controller.listen(item);
					item.project(ViewClass);
					this.collection.push(item);
				}
			}
		}
	}

	class View {

		constructor(parent){
			this.model = null; 
			this.parent = parent || document.getElementsByTagName('body')[0];
		}

		render(){
			this.attach();
		}

		//HTML DOM methods

		toggle(name){
			this.el.classList.toggle(name);
		}

		assignElement(tag){
			this.el = document.createElement(tag);
		}

		make(tag){
			return document.createElement(tag);
		}

		inner(el, val){
			el.innerHTML = val;
		}

		attach(){
			this.parent.appendChild(this.el);
		}

	}

	class CollectionView extends View{

		constructor(){									//views don't have data, only a model with data
			super();									//view constructor is for creating primary element
			this.el = this.make('UL');
			this.el.classList.add('list-group');
			this.subComponents = []; 
		}

		register(){										//register requires the controller

		}

		render(){		
			this.el.innerHTML = "";						//render requires the model
			this.subComponents = [];
			for(let model of this.model.collection){
				this.el.appendChild(model.view.render());
			}

			super.render();

		}
		
	}


	class PageView extends View{

		constructor(){
			super();
			this.assignElement('div');	//creation of primary element
			this.listeners = [];

			var add = this.make('button');
			add.classList.add('btn-primary', 'btn', 'btn-lg');
			add.setAttribute('style','width: 25%;');
			this.el.appendChild(add);

			this.listeners.push(()=>{
				add.addEventListener('click', ()=>{
					this.controller.broadcast({eventName: 'add', message: input.value});
				});
			});

			var remove = this.make('button');
			remove.setAttribute('style','width: 25%;');
			remove.classList.add('btn-danger', 'btn', 'btn-lg');
			this.el.appendChild(remove);

			this.listeners.push(()=>{									//delay registration with controller until controller is present
				remove.addEventListener('click', (e)=>{
					this.controller.broadcast({eventName: 'delete'});
				});
			});

			var input = document.createElement('input');
			input.setAttribute('type','text');
			input.setAttribute('class','form-control');
			input.setAttribute('style','width: 50%; border: 1px solid blue');
			this.el.appendChild(input);

		}

		register(){														//register events on primary and sub-elements
			for (let fn of this.listeners){
				fn();
			}
		}

	}

	class ItemModel extends Model{

		constructor(model){
			super();
			this.collection = model; 						//collection is singular
		}

		register(){


		}

	}

	class ItemView extends View{

		constructor(){
			super();
			this.assignElement('li');						
			this.el.setAttribute('class','list-group-item');
		}

		register(){											
			this.el.addEventListener('click',()=>{
				this.toggle('active');
				this.controller.broadcast({eventName: 'select', model: this.model});
			});
		}

		render(){
			let p = document.createElement('p');
			p.innerHTML = this.model.collection.message;
			this.el.appendChild(p);
			return this.el; 
		}
	}
	

	let a = new CollectionModel();
	let b = new APIModel();
	let c = new PageView();
	b.pipe(a); 
	c.render();
	let d = new Controller().listen(a,b,c); 
	
	a.reduce(ItemModel,ItemView);			
	a.project(CollectionView);
	b.init(); 


}



