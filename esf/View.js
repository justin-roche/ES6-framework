{

	

	function _template(state, temp){
		debugger;
		return (temp);
	}

	class View {

		constructor({controller, parentElement, el, template, listen, controllerEvents}){
			
			this.controller = controller;
			if(controllerEvents) this.controllerEvents = controllerEvents; 
			if(parentElement && typeof parentElement === 'string') this.$parentElement = $(parentElement);
			if(parentElement && parentElement.constructor.name === 'jQuery') this.$parentElement = parentElement;
			if(template) this.template = template; 

			if(!this.controller){
				throw new Error('controller must defined before view');
			}else{
				controller.register(this);
			}
		}

		attachListeners($el){
			let c = this.controller.events || this.controller.parentController.events; 
			let d = this.controllerEvents; 

			for(let event in d){
				let type = d[event][1] || 'click'; //<-default matches for different elements
				let selector = d[event][0];
				let handler = c[event];

				if(!selector){				//no selector
					let $target = $el;
					$target.on(type,handler);
				}
				if(selector){
					let $target = $el.find(selector); 
					$target.on(type,handler);
				}
			}
		}

		onStateChange(){
			this.render();
		}

		render(){
			if(this.$el) {
				this.$el.empty();	//will empty repeated elements;
				this.$el.remove();	//memory leaks on attached listening child controllers?
				this.$el = {};
			} else {
				this.$el = {};
			}
			
			this.$el = $(this.template.call(this));
			if(this.$el.length > 1){
				throw new Error('elements of views can only be one element')
			}
			this.$parentElement.append(this.$el);
			this.attachListeners(this.$el);
		}

	}

	esf.View = View;
}