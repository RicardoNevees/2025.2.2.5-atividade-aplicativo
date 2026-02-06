let db;
const request = indexedDB.open("ListaComprasDB", 1);

// Criar o banco de dados
request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("itens", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    renderizarLista(); // Carrega os dados ao abrir
};

// Função para Adicionar (Create)
function adicionarItem() {
    const nome = document.getElementById("itemInput").value;
    if (!nome) return;

    const transaction = db.transaction(["itens"], "readwrite");
    const store = transaction.objectStore("itens");
    store.add({ nome: nome });

    transaction.oncomplete = () => {
        document.getElementById("itemInput").value = "";
        renderizarLista();
    };
}

// Função para Listar (Retrieve)
function renderizarLista() {
    const listElement = document.getElementById("shoppingList");
    listElement.innerHTML = "";

    const transaction = db.transaction(["itens"], "readonly");
    const store = transaction.objectStore("itens");
    const request = store.getAll();

    request.onsuccess = () => {
        request.result.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.nome} 
                <span class="delete-btn" onclick="removerItem(${item.id})">X</span>
            `;
            listElement.appendChild(li);
        });
    };
}

// Função para Remover (Delete)
function removerItem(id) {
    const transaction = db.transaction(["itens"], "readwrite");
    const store = transaction.objectStore("itens");
    store.delete(id);
    transaction.oncomplete = renderizarLista;
}

document.getElementById("addButton").onclick = adicionarItem;