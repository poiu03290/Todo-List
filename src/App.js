import React, { useState } from 'react'
import { StatusBar, Dimensions } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native'
import { theme } from './theme'
import Input from './components/Input'
import Task from './components/Task'
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLoading from 'expo-app-loading';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.background};
  align-items: center;
  justify-content: flex-start;
`

const Title = styled.Text`
  font-size: 40px;
  font-weight: 600;
  color: ${({theme}) => theme.main};
  width: 100%;
  align-items: flex-end;
  padding: 0 20px;
`

const List = styled.ScrollView`
  flex: 1;
  width: ${({width}) => width-40}px;
`

export default function App() {
  const [newTask, setNewTask] = useState('')
  const width = Dimensions.get('window').width;
  const [tasks, setTasks] = useState({})

  const storageData = async tasks => {
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks))
    setTasks(tasks)
  }

  const getData = async () => {
    const loadedData = await AsyncStorage.getItem('tasks')
    setTasks(JSON.parse(loadedData || '{}'))
  }

  const addTask = () => {
    if (newTask.length < 1) {
      return
    }
    const ID = Date.now().toString()
    const newTaskObject = {
      [ID]: {id: ID, text: newTask, complete: false}
    }
    setNewTask('')
    storageData({...tasks, ...newTaskObject})
  }

  const deleteTask = (id) => {
    const currentTasks = Object.assign({}, tasks);
    delete currentTasks[id]
    storageData(currentTasks)
  }

  const toggleTask = (id) => {
    const currentTasks = Object.assign({}, tasks)
    currentTasks[id]['completed'] = !currentTasks[id]['completed']
    storageData(currentTasks)
  }

  const updateTask = (item) => {
    const currentTasks = Object.assign({}, tasks)
    currentTasks[item.id] = item
    storageData(currentTasks)
  }

  const [isReady, setIsReady] = useState(false);

  return isReady ? (
      <ThemeProvider theme={theme}>
        <Container>
            <Title>Todo List</Title>
            <StatusBar 
              barStyle="light-content" 
              backgroundColor={theme.background}
            />
            <Input 
              placeholder="+ Add a Task"
              value={newTask}
              onChangeText={text => setNewTask(text)}
              onSubmitEditing={addTask}
              onBlur={() => setNewTask('')}
            />
            <List width={width}>
              {Object.values(tasks).reverse().map(item => 
              <Task 
                key={item.id}
                item={item} 
                deleteTask={deleteTask}
                toggleTask={toggleTask}
                updateTask={updateTask}
              />)}
            </List>
        </Container>
    </ThemeProvider>
  ) : (
    <AppLoading 
      startAsync={getData}
      onFinish={() => setIsReady(true)}
      onError={() => {}}
    />
  );
}