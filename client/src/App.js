import React, { Component } from 'react'
import 'bootstrap-css-only/css/bootstrap.min.css'
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'
import { Select, Button } from 'evergreen-ui'

class App extends Component {

    getServer(server) {
        fetch(`/update_items`, { method: 'GET', headers: { 'server': server } })
            /* .then(res => res.json()) // expecting a json response
            .then(json => console.log(json)); */
            .then(res => console.log(res))
    }

    render() {
        return (
            <MDBContainer fluid>
                <MDBRow center>
                    <MDBCol size='6' className='text-center'>
                        <Select onChange={e => this.getServer(e.target.value)}>
                            <option value="1092" selected>Gran Kain</option>
                            <option value="1094">Shillien</option>
                            <hr/>
                            <option value="3061">Silver</option>
                            <option value="3062">Emerald</option>
                            <option value="3501">Crimson</option>
                            <option value="3502">Scarlet</option>
                            <hr/>
                            <option value="45">Blackbird</option>
                            <option value="27">Elcardia</option>
                            <option value="12">Hatos</option>
                        </Select>
                        <Button appearance="primary">Hi Evergreen!</Button>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        );
    }
}

export default App