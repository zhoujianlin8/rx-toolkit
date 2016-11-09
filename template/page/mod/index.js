import React from 'react';
class <%=classedName%> extends React.Component {
	 constructor(props, context) {
        super(props, context);
        this.state = {
          
        };
    }
    render() {
        return (
         <div className="<%= classname %>-page">	
            <%= classname %> hello world
          </div>   
        );
    }
     componentDidMount(){}
}
export default <%=classedName%>;