import React from "react";
import { Redirect, Route } from "react-router-dom";

function ProtectedRoute( {component: Component, ...props} ) {
    if (localStorage.getItem('jwt')) {
        return (
            <Route path="/">
                <Component {...props}/> 
            </Route>
        )
    };
    return (
        <Redirect to="/signin"/>
    )
}

export default ProtectedRoute;