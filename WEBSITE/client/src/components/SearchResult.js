import "../styles/SearchResult.css";

import helpers from "../helpers";

import { useEffect } from "react";

function SearchResult(props) {
    useEffect(() => {
        helpers.checkComponent();
    }, []);

    return (
        <div className="SearchResultContainer">
            {
                props.findUser && props.findUser.length !== 0 ?
                (
                    <ul>
                        {
                            props.findUser.map((element, index) => (
                                <li key={ index } onClick={ props.handleDeleteUser }>{ element.email }</li>
                            ))
                        }
                    </ul>
                ) :
                <span>No results found</span>
            }
        </div>
    );
}

export default SearchResult;