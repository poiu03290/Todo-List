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
  const [tasks, setTasks] = useState({})  // 이 상태변수로 할일목록을 렌더링.

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
    const ID = Date.now().toString()  // ID는 고유한 값으로 설정해주기 위해 시간값을 이용.
    const newTaskObject = {
      [ID]: {id: ID, text: newTask, complete: false}  // 이때 key를 방금 생성한 ID값으로 하고 
    }
    setNewTask('')
    storageData({...tasks, ...newTaskObject})   // 기존의 tasks에다가 사용자가 방금 작성한 newTaskObject를 덧붙임.
  }

  const deleteTask = (id) => {
    const currentTasks = Object.assign({}, tasks);  // 현재 항목들과 동일한 항목을 가지고 있는 변수를 만듦.
    delete currentTasks[id]   // 그 변수에서 id를 삭제시켜준다.
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
                item={item} // deleteTask함수를 사용할때 항목에 id값을 같이 전달해줘야하는데 이떄 item에서 id와 text를 두가지를 전달중이니 코드를 간소화하기위해 item 그자체만 전달해줌. 
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