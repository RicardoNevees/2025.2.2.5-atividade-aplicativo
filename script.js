let db;   // cria uma variável global para armazenar a referência ao bando de dados.
const request = indexedDB.open("ListaComprasDB", 1);

// 1. Configuração do Banco de Dados
request.onupgradeneeded = (event) => {
    db = event.target.result;   // a variável "db", criada no topo, recebe a referência ao banco de dados aberto
    db.createObjectStore("itens", { keyPath: "id", autoIncrement: true });   // comando para criar a "gaveta" (tabela) onde os itens serão guardados.
};

request.onsuccess = (event) => {     //ocorre sempre que você abre o site e o banco de dados é carregado com sucesso.
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
    
    // Criamos o cabeçalho das colunas apenas se houver itens
    listElement.innerHTML = `
        <li class="header-list">
            <span class="col-item">ITEM</span>
            <span class="col-desc">DESCRIÇÃO</span>
            <span class="col-action"></span>
        </li>
    `;

    const transaction = db.transaction(["itens"], "readonly");
    const store = transaction.objectStore("itens");
    const request = store.getAll();

    request.onsuccess = () => {
        const itens = request.result;
        
        // Se não houver itens, limpamos o cabeçalho
        if (itens.length === 0) {
            listElement.innerHTML = "<p style='text-align:center; color:#888;'>Sua lista está vazia</p>";
            return;
        }

        itens.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "item-row"; // Classe para estilizar a linha
            li.innerHTML = `
                <span class="col-item">${index + 1}</span>
                <span class="col-desc">${item.nome}</span>
                <span class="col-action">
                    <span class="delete-btn" onclick="removerItem(${item.id})" title="Remover">X</span>
                </span>
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