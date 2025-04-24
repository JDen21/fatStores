import { Route, Switch } from "wouter";
import FatStore from "./FatStore";

function App() {

  return (
    <Switch>
      <Route path='/fat-store' component={FatStore}/>
    </Switch>
  )
}

export default App
