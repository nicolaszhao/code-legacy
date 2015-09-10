var sort = {
	bubbleSort: function(list) {
		var heavier, isInterchanged;
		for (var i = 0, len = list.length - 1; i < len; i++) {
			isInterchanged = false;
			
			for (var j = len; j > i; j--) {
				if (list[j - 1] > list[j]) {
					heavier = list[j - 1];
					list[j - 1] = list[j];
					list[j] = heavier;
					
					isInterchanged = true;
				}
			}
			if (!isInterchanged) {
				break;
			}
		}
		
		return list;
	},
	
	bubbleSort2: function(list) {
		var len = list.length,
			t, f, i, j;
			
		for (i = 0; i < len; i++) {
			f = true;
			for (j = 0; j < (len - 1) - i; j++) {
				if (a[j] > a[j + 1]) {
					t = a[j + 1];
					a[j + 1] = a[j];
					a[j] = t;
					
					f = false;
				}
			}
			
			if (f) {
				break;
			}
		}
		
		return list;
	},
	
	_division: function(list, left, right) {
		var base = list[left];
		
		while(left < right) {
			while(left < right && list[right] >= base) {
				right--;
			}
			
			list[left] = list[right];
			
			while(left < right && list[left] <= base) {
				left++;
			}
			
			list[right] = list[left];
		}
		list[left] = base;
		
		return left;
	},
	
	quickSort: function(list, left, right) {
		var index;
		
		if (left < right) {
			index = sort._division(list, left, right);
			
			arguments.callee(list, left, index - 1);
			arguments.callee(list, index + 1, right);
		}
		
		return list;
	},
	
	selectionSort: function(list) {
		var base, baseIndex;
		
		for (var i = 0, len = list.length; i < len - 1; i++) {
			baseIndex = i;
			
			for (var j = i + 1; j < len; j++) {
				if (list[baseIndex] > list[j]) {
					baseIndex = j;
				}
			}
			
			base = list[baseIndex];
			list[baseIndex] = list[i];
			list[i] = base;
		}
		
		return list;
	},
	
	/*
	 * 参考: http://www.cnblogs.com/huangxincheng/archive/2011/11/16/2251196.html
	 * 
	 * list: 待排序的集合
	 * parent: 父节点
	 * length: 输出根堆时剔除最大值使用
	 */
	_heapAdjust: function(list, parentIndex, length) {
		var // 保存当前父节点
			parent = list[parentIndex],
			
			// 得到左孩子(这可是二叉树的定义，大家看图也可知道)
			childIndex = 2 * parentIndex + 1;
			
		while(childIndex < length) {
			
			// //如果parent有右孩子，则要判断左孩子是否小于右孩子
			if (childIndex + 1 < length && list[childIndex] < list[childIndex + 1]) {
				childIndex++;
			}
			
			// 父亲节点大于子节点，就不用做交换
			if (parent >= list[childIndex]) {
				break;
			}
			
			// 将较大子节点的值赋给父亲节点
			list[parentIndex] = list[childIndex];
			
			// 然后将子节点做为父亲节点，已防止是否破坏根堆时重新构造
			parentIndex = childIndex;
			
			// 找到该父亲节点较小的左孩子节点
			childIndex = 2 * parentIndex + 1;
		}
		
		// 最后将temp值赋给较大的子节点，以形成两值交换
		list[parentIndex] = parent;
	},
	
	heapSort: function(list) {
		var top, len = list.length;
		
		// list.length/2-1:就是堆中父节点的个数
		for (var i = len / 2 - 1; i >= 0; i--) {
			sort._heapAdjust(list, i, len);
		}
		
		// 最后输出堆元素
		for (var i  = len - 1; i > 0; i--) {
			
			// 堆顶与当前堆的第i个元素进行值对调
			top = list[0];
			list[0] = list[i];
			list[i] = top;
			
			// 因为两值交换，可能破坏根堆，所以必须重新构造
			sort._heapAdjust(list, 0, i);
		}
		
		return list;
	},
	
	insertSort: function(list) {
		var base;
		
		// 无须序列
		for (var i = 1, len = list.length; i < len; i++) {
			base = list[i];
			
			// 有序序列
			for (var j = i - 1; j >= 0 && base < list[j]; j--) {
				list[j + 1] = list[j];
			}
			list[j + 1] = base;
		}
		
		return list;
	},
	
	shellSort: function(list) {
		var len = list.length, step = Math.ceil(len / 2), base;
		while(step > 1) {
			for (var i = step; i < len; i++) {
				base = list[i];
				
				for (var j = i - step; j >= 0 && base < list[j]; j = j - step) {
					list[j + step] = list[j];
				}
				list[j + step] = base;
			}
			step = Math.ceil(step / 2);
		}
		
		sort.insertSort(list);
		
		return list;
	}
};