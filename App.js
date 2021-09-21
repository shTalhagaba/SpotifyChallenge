import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';

import base64 from 'react-native-base64';
import * as RNLocalize from "react-native-localize";

const authApiPrefix = 'https://accounts.spotify.com/api'
const apiPrefix = 'https://api.spotify.com/v1'
const client_id = 'f8eaa1dfdaf1477091822f13da9e45fb'
const client_secret = '3b94362b6c454aeb8675f459d0b2294b'

const base64credentials = base64.encode(client_id + ':' + client_secret)

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [accessToken, setAccessToken] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [userData, setUserData] = React.useState('')
  const [playlist, setPlaylist] = React.useState([])
  const [track, setTrack] = React.useState([])
  const [selectedPlaylist, setSelectedPlaylist] = React.useState(0)
  const [selectedTrack, setSelectedTrack] = React.useState(0)
  const [showSelectedTrack, setShowSelectedTrack] = React.useState(false)
  const [showTrack, setShowTrack] = React.useState(false)

  React.useEffect(async () => {
    setLoading(true)
    console.log("Begin token api")
    const response = await fetch(`${authApiPrefix}/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${base64credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });
    const json = await response.json()
    if (json && json.access_token) {
      setUserData(json)
      getPlaylist(json)
    }
    console.log("token api", json)
  }, [])

  const getPlaylist = async (item) => {
    const country = RNLocalize.getCountry()
    const url = `${apiPrefix}/browse/featured-playlists?country=${country}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${item.access_token}`,
      },
    });
    const json = await response.json()
    if (json && json.playlists && json.playlists.items.length > 0) {
      setPlaylist(json.playlists.items)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  const getTracksList = async (data) => {
    const url = data.item.tracks.href
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userData.access_token}`,
      },
    });
    const json = await response.json()
    if (json && json.items && json.items.length > 0) {
      setSelectedPlaylist(data)
      setTrack(json.items)
      setShowTrack(true)
      setLoading(false)
    } else {
      setSelectedPlaylist('')
      setTrack([])
      setShowSelectedTrack(false)
      setShowTrack(false)
      setLoading(false)
    }
  }
  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  const renderHeader = () => {
    return <View style={{ height: 50, backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <Text style={{ marginVertical: 5, fontSize: 20, fontWeight: '700', alignSelf: 'center', justifyContent: 'center' }}>Country Playlist</Text>
    </View>;
  };

  const renderTrackHeader = () => {
    return <View style={{ marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={() => {
          setShowSelectedTrack(false)
          setShowTrack(false)
          setSelectedPlaylist('')
          setSelectedTrack('')
        }}
        style={{ borderColor: 'black', borderWidth: 2, borderRadius: 10, margin: 7 }} >
        <Text style={{ padding: 10, fontSize: 15, paddingHorizontal: 20 }}>Back</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 20, fontWeight: '700', alignSelf: 'center', justifyContent: 'center', }}>View Track List</Text>
    </View>
  };

  const renderItemComponent = (data) => {
    return (
      <TouchableOpacity
        onPress={() => {
          getTracksList(data)
          setLoading(true)
        }}
        style={{ borderColor: 'grey', borderWidth: 2, borderRadius: 10, flexDirection: 'row', margin: 3 }} >
        <Image source={{ uri: data.item.images[0].url }} style={{ width: 60, height: 60, margin: 10 }} />
        <View style={{ margin: 10 }}>
          <Text style={{ marginVertical: 5, fontSize: 15, fontWeight: '700' }}>Title: {data.item.name}</Text>
          <Text>No of tracks: {data.item.tracks.total}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderItemTrackComponent = (data) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setShowSelectedTrack(true)
          setSelectedTrack(data)
        }}
        style={{ borderColor: 'grey', borderWidth: 2, borderRadius: 10, flexDirection: 'row', margin: 3 }} >
        <Image source={{ uri: data.item.track.album.images[1].url }} style={{ width: 60, height: 60, margin: 10 }} />
        <View style={{ margin: 10 }}>
          <Text style={{ marginVertical: 5, fontSize: 15, fontWeight: '700' }}>Name: {data.item.track.name}</Text>
          <Text>Popularity: {data.item.track.popularity}</Text>
          <Text>Artisit Name: {data.item.track.artists[0].name}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const milliSecondsToMinutes = (ms) => {
    var ms = ms;
    var min = Math.floor((ms / 1000 / 60) << 0);
    var sec = Math.floor((ms / 1000) % 60);
    return min + " Minutes " + sec + " Seconds"
  }

  return (
    <SafeAreaView style={{ flex: 1, }}>
      {loading ?
        <View style={{
          flex: 1,
          justifyContent: 'center', alignSelf: 'center'
        }} >
          <ActivityIndicator size="large" />
        </View>
        : showTrack && !showSelectedTrack ?
          <View style={{ flex: 1, marginBottom: 20, }}>
            <FlatList
              data={track}
              renderItem={item => renderItemTrackComponent(item)}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={renderSeparator}
              ListHeaderComponent={renderTrackHeader}
              scrollEnabled={true}
            />
          </View>
          : showSelectedTrack ?
            <View style={{ flex: 1 }}>
              <View style={{ marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowSelectedTrack(false)
                    setSelectedTrack('')
                  }}
                  style={{ borderColor: 'black', borderWidth: 2, borderRadius: 10, margin: 7 }} >
                  <Text style={{ padding: 10, fontSize: 15, paddingHorizontal: 20 }}>Back</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '700', alignSelf: 'center', justifyContent: 'center', }}>View Track Detail</Text>
              </View>
              <View style={{ backgroundColor: 'grey', margin: 20, alignSelf: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: selectedTrack.item.track.album.images[1].url }}
                  style={{ width: 100, height: 100, margin: 10 }} />
              </View>
              <View
                style={{ borderColor: 'grey', borderWidth: 2, borderRadius: 10, flexDirection: 'row', margin: 3 }} >
                <View style={{ margin: 10 }}>
                  <Text style={{ marginVertical: 5, fontSize: 15, fontWeight: '700' }}>Title: {selectedTrack.item.track.name}</Text>
                  <Text>Artists:{selectedTrack.item.track.artists[0].name}</Text>
                  <Text>Album: {selectedTrack.item.track.album.name}</Text>
                  <Text>Duration: {milliSecondsToMinutes(selectedTrack.item.track.duration_ms)}</Text>
                </View>
              </View>
            </View>
            : <View style={{ flex: 1, marginBottom: 20 }}>
              <FlatList
                data={playlist}
                renderItem={item => renderItemComponent(item)}
                keyExtractor={item => item.id.toString()}
                ItemSeparatorComponent={renderSeparator}
                ListHeaderComponent={renderHeader}
                scrollEnabled={true}
              />
            </View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
