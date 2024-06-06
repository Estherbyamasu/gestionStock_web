// import { createRoutesFromElements,Route,Routes} from "react-router-dom";

import { Route } from "react-router-dom";
import RoleList from "../../pages/role/RoleList";
import NewRole from "../../pages/role/NewRole";
import UpdateRole from "../../pages/role/UpdateRole";



const role_routes_items = {
    roles: {
        path: "role",
        name: "Roles",
        component: RoleList
},
new_role: {
    path: "role/new",
    name: "Nouveau role",
    component: NewRole
},
edit_role: {
    path: "role/edit/:idRole",
    name: "Modifier le role",
    component: UpdateRole
}
}

var role_routes = []
for(let key in role_routes_items) {
          const route = role_routes_items[key]
          role_routes.push(<Route path={route.path} Component={route.component} key={route.path} />)
}
export default role_routes
    