var DataTree = function(data) {
	this.data = [];
	this.$ul = $('<ul class="sample-tree" />');
	this.createTreeData(data);
	this.createTree(this.$ul);
};

DataTree.prototype = {
	constructor: DataTree,
	createTreeData: function(originalData) {
		var len, parent, data;
		
		data = $.extend(true, [], originalData);
		len = data.length;
		
		for (var i = 0; i < len; i++) {
			parent = data[i];
			
			for (var j = 0; j < len; j++) {
				child = data[j];
				
				if (child.parentid === parent.id) {
					if (!parent.nodes) {
						parent.nodes = [];
					}
					parent.nodes.push(child);
				}
			}
		}
		
		for (var i = 0; i < len; i++) {
			if (!data[i].parentid) {
				this.data.push(data[i]);
			}
		}
	},
	
	createTree: function($parent, data) {
		var that = this,
			$ul, $li;
		
		data = typeof data === 'undefined' ? this.data : data;
		
		$.each(data, function(i, node) {
			$li = $('<li />').html('<span class="sample-tree-text">' + node.name + '</span>').appendTo($parent);
			
			if (node.nodes) {
				$ul = $('<ul />').appendTo($li);
				
				that.createTree.call(that, $ul, node.nodes);
			}
		});
	}
};