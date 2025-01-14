export const bubbleSort = (array, speed, setArray, onComplete, isPaused, setComparing, setSwapping) => {
  let newArray = [...array];
  let i = 0;
  let j = 0;
  let isActive = true;
  let sortedIndices = [];

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const sortStep = async () => {
    if (!isActive) return;

    while (isActive) {
      if (isPaused()) {
        await sleep(100);
        continue;
      }

      if (i >= newArray.length - 1) {
        setComparing([]);
        setSwapping([]);
        onComplete([...Array(newArray.length).keys()]);
        return;
      }

      if (j >= newArray.length - i - 1) {
        sortedIndices.push(newArray.length - i - 1);
        j = 0;
        i++;
      }

      setComparing([j, j + 1]);
      
      if (newArray[j] > newArray[j + 1]) {
        setSwapping([j, j + 1]);
        [newArray[j], newArray[j + 1]] = [newArray[j + 1], newArray[j]];
        setArray([...newArray]);
      }
      j++;

      await sleep(500 - (speed * 20));
    }
  };

  sortStep();
  return () => { 
    isActive = false;
    setComparing([]);
    setSwapping([]);
  };
};

export const quickSort = (array, speed, setArray, onComplete, isPaused, setComparing, setSwapping) => {
  let newArray = [...array];
  let isActive = true;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const partition = async (arr, low, high) => {
    if (!isActive) return low;
    
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high && isActive; j++) {
      if (isPaused()) {
        await sleep(100);
        j--;
        continue;
      }

      setComparing([j, high]);
      await sleep(500 - (speed * 20));

      if (arr[j] <= pivot) {
        i++;
        setSwapping([i, j]);
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        await sleep(500 - (speed * 20));
      }
    }

    setSwapping([i + 1, high]);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    await sleep(500 - (speed * 20));

    return i + 1;
  };

  const quickSortRec = async (arr, low, high) => {
    if (low < high && isActive) {
      const pi = await partition(arr, low, high);
      await quickSortRec(arr, low, pi - 1);
      await quickSortRec(arr, pi + 1, high);
    }
  };

  const startSort = async () => {
    await quickSortRec(newArray, 0, newArray.length - 1);
    if (isActive) {
      setComparing([]);
      setSwapping([]);
      onComplete([...Array(newArray.length).keys()]);
    }
  };

  startSort();
  return () => {
    isActive = false;
    setComparing([]);
    setSwapping([]);
  };
};

export const mergeSort = (array, speed, setArray, onComplete, isPaused, setComparing, setSwapping) => {
  let newArray = [...array];
  let isActive = true;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const merge = async (arr, left, mid, right) => {
    if (!isActive) return;

    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length && isActive) {
      if (isPaused()) {
        await sleep(100);
        continue;
      }

      setComparing([left + i, mid + 1 + j]);
      await sleep(500 - (speed * 20));

      if (leftArr[i] <= rightArr[j]) {
        setSwapping([k]);
        arr[k] = leftArr[i];
        i++;
      } else {
        setSwapping([k]);
        arr[k] = rightArr[j];
        j++;
      }
      setArray([...arr]);
      await sleep(500 - (speed * 20));
      k++;
    }
    
    while (i < leftArr.length && isActive) {
      if (isPaused()) {
        await sleep(100);
        continue;
      }

      setSwapping([k]);
      arr[k] = leftArr[i];
      setArray([...arr]);
      await sleep(500 - (speed * 20));
      i++;
      k++;
    }
    
    while (j < rightArr.length && isActive) {
      if (isPaused()) {
        await sleep(100);
        continue;
      }

      setSwapping([k]);
      arr[k] = rightArr[j];
      setArray([...arr]);
      await sleep(500 - (speed * 20));
      j++;
      k++;
    }
  };

  const mergeSortRec = async (arr, left, right) => {
    if (left < right && isActive) {
      const mid = Math.floor((left + right) / 2);
      await mergeSortRec(arr, left, mid);
      await mergeSortRec(arr, mid + 1, right);
      await merge(arr, left, mid, right);
    }
  };

  const startSort = async () => {
    await mergeSortRec(newArray, 0, newArray.length - 1);
    if (isActive) {
      setComparing([]);
      setSwapping([]);
      onComplete([...Array(newArray.length).keys()]);
    }
  };

  startSort();
  return () => {
    isActive = false;
    setComparing([]);
    setSwapping([]);
  };
};

export const insertionSort = (array, speed, setArray, onComplete, isPaused, setComparing, setSwapping) => {
  let newArray = [...array];
  let isActive = true;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const sortStep = async () => {
    if (!isActive) return;

    for (let i = 1; i < newArray.length && isActive; i++) {
      let key = newArray[i];
      let j = i - 1;

      while (isActive && j >= 0 && newArray[j] > key) {
        if (isPaused()) {
          await sleep(100);
          continue;
        }

        setComparing([j, j + 1]);
        setSwapping([j, j + 1]);
        newArray[j + 1] = newArray[j];
        setArray([...newArray]);
        
        await sleep(500 - (speed * 20));
        j--;
      }

      if (isActive) {
        newArray[j + 1] = key;
        setArray([...newArray]);
        await sleep(500 - (speed * 20));
      }
    }

    if (isActive) {
      setComparing([]);
      setSwapping([]);
      onComplete([...Array(newArray.length).keys()]);
    }
  };

  sortStep();
  return () => { 
    isActive = false;
    setComparing([]);
    setSwapping([]);
  };
};
