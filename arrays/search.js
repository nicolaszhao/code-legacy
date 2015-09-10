var search = {
	sequenceSearch: function(list, key) {
		for (var i = 0; i < list.length; i++) {
			if (list[i] == key) {
				return i;
			}
		}
		
		return -1;
	},
	
	binarySearch: function(list, key) {
		var low = 0, high = list.length - 1, middle;
		
		while(low <= high) {
			middle = Math.ceil((low + high) / 2);
			
			if (list[middle] == key) {
				return middle;
			} else if (list[middle] > key) {
				high = middle - 1;
			} else {
				low = middle + 1;
			}
		}
		
		return -1;
	}
};

