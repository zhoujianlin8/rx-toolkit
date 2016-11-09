import React,{Component,PropTypes} from 'react';

import classNames from 'classnames/bind';
import styles from './index.less';
const cx = classNames.bind(styles);

class <%=classedName%> extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {data,className} = this.props
        return (
            <div className={cx('<%=classedName%>')}>
                <div> hello world</div>
            </div>
        );
    }
};

<%=classedName%>.propTypes = {
    //组件所需的数据
    data : PropTypes.object,
};


<%=classedName%>.defaultProps = {
    data : {}
};

export default <%=classedName%>;

