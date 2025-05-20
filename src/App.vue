<template>
  <div class="container">

  <div class="card p-4">
    <h1>Items Information </h1>

    <form @submit.prevent="saveItem" class=" p-4">
    <div class="row">
    <div class="col-sm-5">
      <input v-model="form.name" class="form-control" placeholder="Name" required />
      </div>
      <div class="col-sm-5">
      <input v-model="form.description"  class="form-control" placeholder="Description" />
      </div>
        <div class="col-sm-2">
      <button type="submit" class="btn btn-primary" >{{ form.id ? "Update" : "Add" }}</button>
      <button v-if="form.id" class="btn btn-primary" type="button" @click="resetForm">Cancel</button>
      </div></div>
    </form>

  

<table class="table table-bordered">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">Description</th>
      <th scope="col" width="13%">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item, index) in items" :key="item.id">
      <th scope="row">{{ index + 1 }}</th>
      <td>{{ item.name }}</td>
      <td>{{ item.description }}</td>
      <td>
        <button class="btn btn-success" @click="editItem(item)">Edit</button>
        <button class="btn btn-danger" @click="deleteItem(item.id)">delete
</button>
      </td>
    </tr>
  </tbody>
</table>










  </div>



  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import axios from "axios";
import 'primeicons/primeicons.css'

const items = ref([]);
const form = ref({ id: null, name: "", description: "" });

const fetchItems = async () => {
  try {
    const res = await axios.get("http://localhost:3002/items");
    items.value = res.data;
  } catch (error) {
    alert("Error fetching items");
  }
};

const saveItem = async () => {
  try {
    if (form.value.id) {
      // Update
      await axios.put(`http://localhost:3002/items/${form.value.id}`, {
        name: form.value.name,
        description: form.value.description,
      });
    } else {
      // Create
      await axios.post("http://localhost:3002/items", {
        name: form.value.name,
        description: form.value.description,
      });
    }
    resetForm();
    fetchItems();
  } catch (error) {
    alert("Error saving item");
  }
};

const editItem = (item) => {
  form.value = { ...item };
};

const deleteItem = async (id) => {
  if (!confirm("Are you sure?")) return;
  try {
    await axios.delete(`http://localhost:3002/items/${id}`);
    fetchItems();
  } catch (error) {
    alert("Error deleting item");
  }
};

const resetForm = () => {
  form.value = { id: null, name: "", description: "" };
};

onMounted(fetchItems);
</script>

<style>
.app {
  max-width: 600px;
  margin: 30px auto;
  font-family: Arial, sans-serif;
}

form input {
  margin-right: 10px;
}

button {
  margin-left: 5px;
}
</style>
