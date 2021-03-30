function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === parseInt(obj)) {
            return true;
        }
    }

    return false;
}

var treedrag = Vue.component('tree-drag',{
    template: `
        <item v-if="trees.subs" :tree="trees">
        </item>
    `,
    data: () => ({
        trees: {}
    }),
    created(){
    },
});

var items = Vue.component('item',{
    template: `
      <li @click.stop="toggle">

        <span v-if="tree.detail.type === 'dir'" class="file-hover font-weight-bold" @dragover.prevent @drop="dropItem(tree, $event)">
            <span class="material-icons align-middle">folder</span>
            <span class="align-middle">{{ tree.name }}</span>
        </span>

        <span v-else>
            <div class="font-weight-bold text-primary file-hover" @dragover.prevent @drop="dropItem(tree, $event)" draggable=true @dragstart="dragStart(tree, $event, 'i2')">
                <span class="material-icons align-middle">category</span>
                <span class="align-middle">{{ tree.name }}</span>
            </div>
        </span>
        
        <ul v-show="open" v-if="tree.subs && tree.subs.length > 0" class="tree-ul">
          <item v-for="(node, index) in tree.subs" :tree="node" :key="node.id">
          </item>
        </ul>
      </li>
    `,
    props: {
        tree: Object
    },
    data() {
        return{
            open: true,
            temp_parent_node: {}
        }
    },
    created(){

    },
    methods: {
        toggle(){
            if(this.tree && this.tree.length > 0){
                this.open = !this.open
            }
        },
        dragStart: function(element, event, dragtype) {
            event.dataTransfer.setData("item", element.id);
            event.dataTransfer.setData("dragtype", dragtype);
        },
        dropItem: function(node, event) {
            // console.log(node, event.dataTransfer.getData("item"));
            // console.log(vm.$root.$children[0]._data.trees);
            const vm = this;
            var dragtype = event.dataTransfer.getData("dragtype");
            var dragtype = dragtype + 'i';

            if(dragtype === 'o2i'){
                if(node.uplevel && node.detail.type === 'item'){
                    var uplevel = vm.searchTree(vm.$root.$children[0]._data.trees, node.uplevel);
                    var dropitem = dropApp.items.find(element => element.id == event.dataTransfer.getData("item"));
                    dropApp.items = dropApp.items.filter(function(item, index, array){
                        return item.id != parseInt(event.dataTransfer.getData("item"));
                    });
                    dropitem.uplevel = node.uplevel;
                    uplevel.subs.push(dropitem);
    
                }else if(node.uplevel && node.detail.type === 'dir'){
                    var this_level = vm.searchTree(vm.$root.$children[0]._data.trees, node.id);
                    var dropitem = dropApp.items.find(element => element.id == event.dataTransfer.getData("item"));
                    dropApp.items = dropApp.items.filter(function(item, index, array){
                        return item.id != parseInt(event.dataTransfer.getData("item"));
                    });
                    dropitem.uplevel = node.id;
                    this_level.subs.push(dropitem);
                }
            }else{
                var this_level = vm.searchTree(vm.$root.$children[0]._data.trees, node.id);

                if(node.uplevel && node.detail.type === 'item'){
                    var uplevel = vm.searchTree(vm.$root.$children[0]._data.trees, node.uplevel);

                    if(!containsObject(event.dataTransfer.getData("item"), uplevel.subs)){ 
                        var dropitem = vm.searchTree(vm.$root.$children[0]._data.trees, event.dataTransfer.getData("item"));
                        var origin_level = vm.searchTree(vm.$root.$children[0]._data.trees, dropitem.uplevel);

                        origin_level.subs = origin_level.subs.filter(function(item, index, array){
                            return item.id != parseInt(event.dataTransfer.getData("item"));
                        });
                        dropitem.uplevel = node.uplevel;
                        uplevel.subs.push(dropitem);
                    }
        
                }else if(node.uplevel && node.detail.type === 'dir'){

                    if(!containsObject(event.dataTransfer.getData("item"), this_level.subs)){
                        var dropitem = vm.searchTree(vm.$root.$children[0]._data.trees, event.dataTransfer.getData("item"));
                        var origin_level = vm.searchTree(vm.$root.$children[0]._data.trees, dropitem.uplevel);

                        origin_level.subs = origin_level.subs.filter(function(item, index, array){
                            return item.id != parseInt(event.dataTransfer.getData("item"));
                        });      
                        dropitem.uplevel = node.id;
                        this_level.subs.push(dropitem);
                    }
                }
            }
        },
        searchTree(element, matchingID){
            const vm = this;
            if(element.id == matchingID){
                return element;
            }else if (element.subs != null){
                var i;
                var result = null;
                for(i=0; result == null && i < element.subs.length; i++){
                    result = vm.searchTree(element.subs[i], matchingID);
                }
                return result;
            }
            return null;
        }
    }
});

var dropApp = new Vue({
    el: '#item_drop_div',
    delimiters: ["[[", "]]"],
    data: () => ({
        treeOptions: {
            propertyNames: {
                text: 'name',
                children: 'subs',
                state: 'OPTIONS',
                data: 'detail',
                id: 'id',
            },
            dnd: false,
            parentSelect: true,
            // checkbox: true
        }, // 樹狀圖選項
        temp_node: {},

        items: [
            {name: 'item5', uplevel: 'None', id: 15, detail: {type: 'item'}},
            {name: 'item6', uplevel: 'None', id: 16, detail: {type: 'item'}}
        ]
    }),
    created: function(){
        const vm = this;
    },
    mounted: function(){
        const vm = this;
    },
    components: {
        'draggable': treedrag,
        'item': items
    },
    methods: {
        dragStart: function(element ,event, dragtype) {
            // console.log(element, event);
            event.dataTransfer.setData("item", element.id);
            event.dataTransfer.setData("dragtype", dragtype);
        },
        dropItem: function(node, event) {
            const vm = this;
            var dragtype = dragtype + 'o';

            if(!containsObject(event.dataTransfer.getData("item"), vm.items)){
                var dropitem = vm.searchTree(vm.$root.$children[0]._data.trees, event.dataTransfer.getData("item"));
                var origin_level = vm.searchTree(vm.$root.$children[0]._data.trees, dropitem.uplevel);

                origin_level.subs = origin_level.subs.filter(function(item, index, array){
                    return item.id != parseInt(event.dataTransfer.getData("item"));
                });
                dropitem.uplevel = '';
                
                vm.items.push(dropitem);
            }

        },
        searchTree(element, matchingID){
            const vm = this;
            if(element.id == matchingID){
                return element;
            }else if (element.subs != null){
                var i;
                var result = null;
                for(i=0; result == null && i < element.subs.length; i++){
                    result = vm.searchTree(element.subs[i], matchingID);
                }
                return result;
            }
            return null;
        },
        show_tree_data(){
            const vm = this;

            const tree = vm.$root.$children[0]._data.trees;
            console.log(tree);
        },
        loadtree_data(){
            const vm = this;

            // get tree data by ajax promise
            var tree_data = { name: '測試樹狀圖', subs: [
                    { name: 'AAA', subs: [
                        { name: 'AAA_1', subs: [
                            { name: 'AAAA_1', subs: [], uplevel: 2, id: 5, detail: { type: 'dir' }},
                        ], uplevel: 1, id: 2, detail: { type: 'dir' }
                        },
                        { name: 'item1', uplevel: 1, id: 11, detail: { type: 'item' }},
                        { name: 'item2', uplevel: 1, id: 12, detail: { type: 'item' }},
                    ], uplevel: 'None', id: 1, detail: { type: 'dir' }
                    },
                    { name: 'BBB', subs: [
                        {name: 'item3', uplevel: 3, id: 13, detail: { type: 'item' }}, 
                        {name: 'item4', uplevel: 3, id: 14, detail: { type: 'item' }},
                    ], uplevel: 'None', id: 3, detail: { type: 'dir' }
                    },
                    { name: 'CCC', subs: [], uplevel: 1000, id: 4, detail: { type: 'dir' }},
                ], uplevel: 'None', id: 1000, detail: { type: 'dir' }
            };

            vm.$root.$children[0]._data.trees = tree_data;
        }
    }
});