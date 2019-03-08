var bladeComponent = Vue.component('blade', {
    template: '<div class="blade" :style="style">'
            + ' <div class="blade-content" />'
            + '</div>',
    props: {
        item: {
            type: Object,
            required: true,
            validator: function (v) {
                return v._isVue;
            }
        }
    },
    methods: {
        scroll: function() {
            this.$nextTick(function() {
                this.$el.scrollIntoView();
            });
        }
    },
    computed: {
        style: function() {
            var s = {};
            if (this.item.bladeWidth) s.width = this.item.bladeWidth;
            return s;
        }
    },
    mounted: function() {
        this.item.$mount();
        this.$el.childNodes[0].appendChild(this.item.$el);
        this.item.$on('blade-scroll', this.scroll);
    },
    beforeDestroy: function() {
        this.item.$destroy();
    }
});

var containerComponent = Vue.component('blade-container', {
    template: '<div class="blade-container">'
            + ' <blade v-for="b in blades" :key="b._uid" :item="b" />'
            + '</div>',
    props: {
        cascadeRemove: {
            type: Boolean,
            default: true
        },
        autoScroll: {
            type: Boolean,
            default: true
        }
    },
    data: function() {
        return {
            blades: [],
            scrollTimeout: null
        };
    },
    methods: {
        add: function(ctor, props) {
            var instance = ctor._isVue ? ctor : new ctor({
                propsData: props,
                parent: this
            });
            instance.$on('blade-close', this.remove.bind(this, instance));
            this.blades.push(instance);

            this.$nextTick(function() {
                this.$el.lastChild.scrollIntoView();
            });
        },
        remove: function(comp) {
            var idx = this.blades.indexOf(comp);
            if (idx < 0) return;

            var rem = this.cascadeRemove ? this.blades.length - idx : 1;
            this.blades.splice(idx, rem);
        }
    }
})