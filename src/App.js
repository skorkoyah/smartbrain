import React from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/navigation.component';
import Logo from './components/Logo/logo.component'
import ImageLinkForm from './components/ImageLinkForm/imagelinkform.component';
import Rank from './components/Rank/rank.component';
import FaceRecognition from './components/FaceRecognition/facerecognition.component';
import Signin from './components/Signin/signin.component';
import Register from './components/Register/register.component';
import './App.css';


const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800,
      }
    }
  }
}


 const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
  }
 }

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }


  loadUser = (data) => {
    this.setState({user: {
            id: data.id,
            name: data.name,
            email: data.email,
            password: data.password,
            entries: data.entries,
            joined: data.joined
    }})
  }
  
  calculateFaceLocation = (userData) => {
    const clarifaiFace = userData.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }
  
  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('http://localhost:3000/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
      })
      .then(response => response.json())
      .then(response => {
      if (response) {
        fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
      })
      .then(response => response.json())
      .then(count => {
        console.log(count);
        this.setState(Object.assign(this.state.user, { entries: count }))
      }).catch(console.log);

    }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }


  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        <Particles className='particles' 
            params={particlesOptions}
          />
  
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' ? 
          <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          : (
              route === 'signin' 
              ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />           
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />             
            )
        }
      </div>
    );
  }
  
}

export default App;
