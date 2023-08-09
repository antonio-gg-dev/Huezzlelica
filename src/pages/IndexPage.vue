<template>
  <LogIn
    :token="token"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LogIn from '@/components/LogIn.vue'

export default defineComponent({
  components: {
    LogIn
  },

  data () {
    return {
      token: null as null | string
    }
  },

  mounted () {
    const params = new URLSearchParams(this.$route.path.replace('/', ''))

    window.history.replaceState({}, '', '/')

    this.token = params.get('access_token')
  }
})
</script>
