import React from 'react';
class <%=classedName%> extends React.Component {
	constructor(props, context) {
        super(props, context);
        this.state = {
          
        };
    }
    render() {
        return (
         <div className="<%= classname %>-component">	
            <%= classname %> hello world
          </div>   
        );
    }
    componentDidMount(){}
    
}
<%=classedName%>.defaultProps = {

}
export default <%=classedName%>;

