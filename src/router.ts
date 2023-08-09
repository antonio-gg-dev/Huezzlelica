import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import IndexPage from '@/pages/IndexPage.vue'
import GamePage from '@/pages/GamePage.vue'

const routes: Array<RouteRecordRaw> = [{
  path: '/play/:token',
  component: GamePage,
  props: true
}, {
  path: '/:pathMatch(.*)*',
  component: IndexPage
}]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/*
http://localhost:8080/#/access_token=y5sqlfcmth94bjy4k8ydr1ew8woogs&id_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJjZnd1dW1mYm93ZmRjejNxdjZxaDF2MDNkeTRzMHUiLCJleHAiOjE2OTE1OTc3MjksImlhdCI6MTY5MTU5NjgyOSwiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiNTY1MTc3MjAiLCJhdF9oYXNoIjoiMlExeWJzWmFZY2txd0ZwZGZkeXBqZyIsImF6cCI6ImNmd3V1bWZib3dmZGN6M3F2NnFoMXYwM2R5NHMwdSIsInByZWZlcnJlZF91c2VybmFtZSI6IlRpdGFfS2F0aSJ9.doksun8pS5DdndYSKChGBLOq_7JB-04SA-ldLZxSGFKzICbxbCOQl62OzRS49PhNBEk4jWKkqbimS9EDlGis0LtyCaTMIt4DZjV-YzFmU2-HvkD22YmJdVVUinvzXqlhxjA30u-2yJmdrrlyP-Vyuro2yGCvuwaaCF03CnxtRG3PNjvPgwVEqHWyidoxX3pKYouVkTzTg6i5RmneZbrfAU1yVry43RtBhPWY_7wXOiMg-qozzgPXEv4ljLewSisfdjkl_5IC5-xQBS1F_fQOAlH1KAMbW5Dt3dOTmn3sPJieFS4ULdluYsIBrFheDiNIT0XtYceKGi7V7U9aNuvOPg&scope=openid+moderator%253Amanage%253Abanned_users&token_type=bearer
*/
