let db;
const request = indexedDB.open("ListaComprasDB", 1);

// 1. Configuração do Banco de Dados
request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("itens", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    renderizarLista(); 
};

// 2. Funções de Gerenciamento (CRUD)
function adicionarItem() {
    const input = document.getElementById("itemInput");
    const nome = input.value.trim(); // .trim() remove espaços vazios inúteis

    if (nome === "") return; // Não adiciona se estiver vazio

    const transaction = db.transaction(["itens"], "readwrite");
    const store = transaction.objectStore("itens");
    store.add({ nome: nome });

    transaction.oncomplete = () => {
        input.value = ""; // Limpa o campo após adicionar
        renderizarLista();
    };
}

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
                <span>${item.nome}</span> 
                <span class="delete-btn" onclick="removerItem(${item.id})" title="Remover item">X</span>
            `;
            listElement.appendChild(li);
        });
    };
}

function removerItem(id) {
    const transaction = db.transaction(["itens"], "readwrite");
    const store = transaction.objectStore("itens");
    store.delete(id);
    transaction.oncomplete = renderizarLista;
}

// 3. OUVINTES DE EVENTOS (Onde a mágica acontece)
// Esse bloco deve ficar no final para garantir que as funções acima já existam

// Clique no botão
document.getElementById("addButton").onclick = adicionarItem;

// Aperto da tecla Enter
document.getElementById("itemInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        adicionarItem();
    }
});