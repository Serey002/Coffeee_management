        // ===== DATA =====
        const db = {
            products: [
                { id: 1, name: 'Espresso', price: 2.5, category: 'Coffee', cost: 0.8 },
                { id: 2, name: 'Cappuccino', price: 4.5, category: 'Coffee', cost: 1.5 },
                { id: 3, name: 'Latte', price: 5, category: 'Coffee', cost: 1.8 },
                { id: 4, name: 'Americano', price: 3.5, category: 'Coffee', cost: 1 },
                { id: 5, name: 'Macchiato', price: 4, category: 'Coffee', cost: 1.4 },
                { id: 6, name: 'Green Tea', price: 3.5, category: 'Tea', cost: 0.7 },
                { id: 7, name: 'Croissant', price: 3.5, category: 'Food', cost: 1 },
                { id: 8, name: 'Muffin', price: 3, category: 'Food', cost: 0.8 }
            ],
            orders: [],
            income: [],
            expenses: [],
            inventory: [],
            staff: [],
            customers: [],
            suppliers: [],
            currentOrder: [],
            reports: []
        };

        function loadData() {
            const saved = localStorage.getItem('coffeeShopDB');
            if (saved) Object.assign(db, JSON.parse(saved));
            initializeData();
        }

        function initializeData() {
            if (db.inventory.length === 0) {
                db.inventory = [
                    { id: 1, name: 'Arabica Beans', category: 'Coffee Beans', stock: 50, min: 20, cost: 15 },
                    { id: 2, name: 'Fresh Milk', category: 'Milk', stock: 100, min: 40, cost: 3 },
                    { id: 3, name: 'Almond Milk', category: 'Milk', stock: 20, min: 10, cost: 4 }
                ];
            }
            if (db.suppliers.length === 0) {
                db.suppliers = [
                    { id: 1, name: 'Premium Coffee Co.', contact: 'John Smith', phone: '555-0101', email: 'john@coffee.com' },
                    { id: 2, name: 'Fresh Dairy', contact: 'Sarah Lee', phone: '555-0102', email: 'sarah@dairy.com' }
                ];
            }
        }

        function saveData() {
            localStorage.setItem('coffeeShopDB', JSON.stringify(db));
        }

        // ===== PAGE NAVIGATION =====
        function switchPage(page) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(page).classList.add('active');
            
            document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
            event.target.closest('.nav-link').classList.add('active');

            if (page === 'dashboard') updateDashboard();
            else if (page === 'financial') updateFinancial();
            else if (page === 'inventory') updateInventory();
            else if (page === 'staff') updateStaff();
            else if (page === 'loyalty') updateLoyalty();
            else if (page === 'strategy') updateStrategy();
            else if (page === 'reports') updateReports();
            else if (page === 'pos') updatePOS();
        }

        // ===== POS =====
        function updatePOS() {
            const menu = document.getElementById('posMenu');
            menu.innerHTML = '';
            db.products.forEach(p => {
                menu.innerHTML += `
                    <div class="col-md-4">
                        <div class="pos-item" onclick="addToPOS(${p.id}, '${p.name}', ${p.price})">
                            <h6>${p.name}</h6>
                            <p class="text-success fw-bold">$${p.price}</p>
                        </div>
                    </div>
                `;
            });
        }

        function addToPOS(id, name, price) {
            const existing = db.currentOrder.find(i => i.id === id);
            if (existing) {
                existing.qty++;
            } else {
                db.currentOrder.push({ id, name, price, qty: 1 });
            }
            refreshPOSOrder();
        }

        function refreshPOSOrder() {
            const items = document.getElementById('orderItems');
            items.innerHTML = '';
            let subtotal = 0;

            db.currentOrder.forEach((item, idx) => {
                const total = item.price * item.qty;
                subtotal += total;
                items.innerHTML += `
                    <div class="order-item">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small>$${item.price} x ${item.qty}</small>
                        </div>
                        <div>
                            <span class="badge bg-info">$${total.toFixed(2)}</span>
                            <button class="btn btn-sm btn-danger" onclick="removeFromOrder(${idx})">×</button>
                        </div>
                    </div>
                `;
            });

            if (db.currentOrder.length === 0) {
                items.innerHTML = '<p class="text-muted">No items</p>';
            }

            const tax = subtotal * 0.1;
            const total = subtotal + tax;

            document.getElementById('posSubtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('posTax').textContent = `$${tax.toFixed(2)}`;
            document.getElementById('posTotal').textContent = `$${total.toFixed(2)}`;
        }

        function removeFromOrder(idx) {
            db.currentOrder.splice(idx, 1);
            refreshPOSOrder();
        }

        function completePOSOrder() {
            if (db.currentOrder.length === 0) {
                alert('No items in order');
                return;
            }

            const total = parseFloat(document.getElementById('posTotal').textContent.replace('$', ''));
            const order = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                items: [...db.currentOrder],
                total: total
            };

            db.orders.push(order);
            
            const income = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                category: 'Sales',
                amount: total,
                description: `Order ${order.id}`
            };
            db.income.push(income);

            saveData();
            clearPOSOrder();
            alert(`Order completed: $${total.toFixed(2)}`);
        }

        function clearPOSOrder() {
            db.currentOrder = [];
            refreshPOSOrder();
        }

        // ===== INVENTORY =====
        function updateInventory() {
            const table = document.getElementById('inventoryTable');
            table.innerHTML = '';
            
            db.inventory.forEach(item => {
                const status = item.stock <= item.min ? 
                    '<span class="badge bg-danger">Low</span>' : 
                    '<span class="badge bg-success">OK</span>';
                
                table.innerHTML += `
                    <tr ${item.stock <= item.min ? 'class="low-stock"' : ''}>
                        <td><strong>${item.name}</strong></td>
                        <td>${item.category}</td>
                        <td>${item.stock}</td>
                        <td>${item.min}</td>
                        <td>$${item.cost}</td>
                        <td>${status}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteInv(${item.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });

            const wasteSelect = document.getElementById('wasteItem');
            wasteSelect.innerHTML = '';
            db.inventory.forEach(item => {
                wasteSelect.innerHTML += `<option value="${item.id}">${item.name}</option>`;
            });

            updateLowStockAlerts();
            updateSuppliers();
        }

        function updateLowStockAlerts() {
            const alerts = document.getElementById('lowStockAlerts');
            const low = db.inventory.filter(i => i.stock <= i.min);
            
            if (low.length === 0) {
                alerts.innerHTML = '<p class="text-muted">All items in stock</p>';
            } else {
                alerts.innerHTML = low.map(item => 
                    `<div class="alert alert-warning mb-2"><strong>${item.name}:</strong> ${item.stock}/${item.min}</div>`
                ).join('');
            }
        }

        function addInventory() {
            const item = {
                id: Date.now(),
                name: document.getElementById('invName').value,
                category: document.getElementById('invCategory').value,
                stock: parseInt(document.getElementById('invStock').value),
                min: parseInt(document.getElementById('invMin').value),
                cost: parseFloat(document.getElementById('invCost').value)
            };
            db.inventory.push(item);
            saveData();
            updateInventory();
            bootstrap.Modal.getInstance(document.getElementById('inventoryModal')).hide();
        }

        function deleteInv(id) {
            db.inventory = db.inventory.filter(i => i.id !== id);
            saveData();
            updateInventory();
        }

        function recordWaste() {
            const itemId = document.getElementById('wasteItem').value;
            const qty = parseInt(document.getElementById('wasteQty').value);
            
            const item = db.inventory.find(i => i.id == itemId);
            if (item && item.stock >= qty) {
                item.stock -= qty;
                saveData();
                updateInventory();
                alert('Waste recorded');
                document.getElementById('wasteQty').value = '';
            }
        }

        function updateSuppliers() {
            const list = document.getElementById('suppliersList');
            list.innerHTML = db.suppliers.map(s => `
                <div class="mb-2 p-2 bg-light rounded">
                    <strong>${s.name}</strong><br>
                    <small>${s.contact} | ${s.phone} | ${s.email}</small>
                </div>
            `).join('');
        }

        function addSupplier() {
            const supplier = {
                id: Date.now(),
                name: document.getElementById('supplierName').value,
                contact: document.getElementById('supplierContact').value,
                phone: document.getElementById('supplierPhone').value,
                email: document.getElementById('supplierEmail').value
            };
            db.suppliers.push(supplier);
            saveData();
            updateSuppliers();
            bootstrap.Modal.getInstance(document.getElementById('supplierModal')).hide();
        }

        // ===== FINANCIAL =====
        function updateFinancial() {
            const today = new Date().toLocaleDateString();
            const thisMonth = new Date().getMonth();
            
            const todayInc = db.income.filter(i => i.date === today).reduce((s, i) => s + i.amount, 0);
            const todayExp = db.expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
            
            const monthInc = db.income.filter(i => new Date(i.date).getMonth() === thisMonth).reduce((s, i) => s + i.amount, 0);
            const monthExp = db.expenses.filter(e => new Date(e.date).getMonth() === thisMonth).reduce((s, e) => s + e.amount, 0);

            document.getElementById('monthIncome').textContent = `$${monthInc.toFixed(2)}`;
            document.getElementById('monthExpense').textContent = `$${monthExp.toFixed(2)}`;
            document.getElementById('monthProfit').textContent = `$${(monthInc - monthExp).toFixed(2)}`;

            updateIncomeTable();
            updateExpenseTable();
            updateExpenseChart();
        }

        function updateIncomeTable() {
            document.getElementById('incomeTable').innerHTML = db.income.map(i => `
                <tr>
                    <td>${i.category}</td>
                    <td>$${i.amount.toFixed(2)}</td>
                    <td>${i.date}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteIncome(${i.id})">×</button></td>
                </tr>
            `).join('');
        }

        function updateExpenseTable() {
            document.getElementById('expenseTable').innerHTML = db.expenses.map(e => `
                <tr>
                    <td>${e.category}</td>
                    <td>$${e.amount.toFixed(2)}</td>
                    <td>${e.date}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteExpense(${e.id})">×</button></td>
                </tr>
            `).join('');
        }

        function addIncome() {
            db.income.push({
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                category: document.getElementById('incomeCategory').value,
                amount: parseFloat(document.getElementById('incomeAmount').value),
                description: document.getElementById('incomeDesc').value
            });
            saveData();
            updateFinancial();
            bootstrap.Modal.getInstance(document.getElementById('incomeModal')).hide();
        }

        function addExpense() {
            db.expenses.push({
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                category: document.getElementById('expenseCategory').value,
                amount: parseFloat(document.getElementById('expenseAmount').value),
                description: document.getElementById('expenseDesc').value
            });
            saveData();
            updateFinancial();
            bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
        }

        function deleteIncome(id) {
            db.income = db.income.filter(i => i.id !== id);
            saveData();
            updateFinancial();
        }

        function deleteExpense(id) {
            db.expenses = db.expenses.filter(e => e.id !== id);
            saveData();
            updateFinancial();
        }

        function calculateBreakEven() {
            const fixed = parseFloat(document.getElementById('fixedCosts').value);
            const cost = parseFloat(document.getElementById('itemCost').value);
            const price = parseFloat(document.getElementById('itemPrice').value);
            const margin = price - cost;
            const breakEven = margin > 0 ? Math.ceil(fixed / margin) : 0;
            document.getElementById('breakEven').textContent = breakEven;
        }

        function updateExpenseChart() {
            const ctx = document.getElementById('expenseChart');
            if (!ctx) return;

            const cats = {};
            db.expenses.forEach(e => {
                cats[e.category] = (cats[e.category] || 0) + e.amount;
            });

            const chart = Chart.getChart(ctx);
            if (chart) chart.destroy();

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(cats),
                    datasets: [{
                        data: Object.values(cats),
                        backgroundColor: ['#5C3D2E', '#8B6F47', '#D4A574', '#FFD700', '#FF9800', '#FF6B6B']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // ===== STAFF =====
        function updateStaff() {
            document.getElementById('staffTable').innerHTML = db.staff.map(s => `
                <tr>
                    <td>${s.name}</td>
                    <td>${s.position}</td>
                    <td>$${s.salary.toFixed(2)}</td>
                    <td>${s.startDate}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteStaff(${s.id})">×</button></td>
                </tr>
            `).join('');

            const payroll = db.staff.reduce((s, st) => s + st.salary, 0);
            document.getElementById('totalPayroll').textContent = `$${payroll.toFixed(2)}`;

            const shiftSelect = document.getElementById('shiftStaff');
            shiftSelect.innerHTML = db.staff.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }

        function addStaff() {
            db.staff.push({
                id: Date.now(),
                name: document.getElementById('staffName').value,
                position: document.getElementById('staffPosition').value,
                salary: parseFloat(document.getElementById('staffSalary').value),
                startDate: document.getElementById('staffStart').value
            });
            saveData();
            updateStaff();
            bootstrap.Modal.getInstance(document.getElementById('staffModal')).hide();
        }

        function deleteStaff(id) {
            db.staff = db.staff.filter(s => s.id !== id);
            saveData();
            updateStaff();
        }

        function addShift() {
            alert('Shift added successfully');
            document.getElementById('shiftDate').value = '';
            document.getElementById('shiftStart').value = '';
            document.getElementById('shiftEnd').value = '';
        }

        function saveChecklist() {
            alert('Checklist saved');
        }

        // ===== LOYALTY =====
        function updateLoyalty() {
            document.getElementById('customerTable').innerHTML = db.customers.map(c => {
                const tier = c.points < 50 ? 'Bronze' : c.points < 100 ? 'Silver' : 'Gold';
                return `
                    <tr>
                        <td>${c.name}</td>
                        <td>${c.email}</td>
                        <td>${c.points}</td>
                        <td><span class="badge bg-warning">${tier}</span></td>
                        <td>${c.visits}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="addPoints(${c.id})">+10</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCust(${c.id})">×</button>
                        </td>
                    </tr>
                `;
            }).join('');

            const total = db.customers.length;
            const repeat = db.customers.filter(c => c.visits > 1).length;
            
            document.getElementById('totalCusts').textContent = total;
            document.getElementById('repeatCusts').textContent = repeat;
            document.getElementById('avgRating').textContent = '4.5★';
        }

        function addCustomer() {
            db.customers.push({
                id: Date.now(),
                name: document.getElementById('custName').value,
                email: document.getElementById('custEmail').value,
                phone: document.getElementById('custPhone').value,
                points: 0,
                visits: 0
            });
            saveData();
            updateLoyalty();
            bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
        }

        function addPoints(id) {
            const cust = db.customers.find(c => c.id === id);
            if (cust) {
                cust.points += 10;
                cust.visits++;
                saveData();
                updateLoyalty();
            }
        }

        function deleteCust(id) {
            db.customers = db.customers.filter(c => c.id !== id);
            saveData();
            updateLoyalty();
        }

        // ===== STRATEGY =====
        function updateStrategy() {
            const today = new Date().toLocaleDateString();
            const todayOrders = db.orders.filter(o => o.date.includes(today));
            const sales = todayOrders.reduce((s, o) => s + o.total, 0);
            const avg = todayOrders.length > 0 ? (sales / todayOrders.length).toFixed(2) : 0;

            document.getElementById('avgTicket').textContent = `$${avg}`;
            document.getElementById('peakHour').textContent = '12:00 PM';
            document.getElementById('topProduct').textContent = 'Cappuccino';
            
            const repeat = db.customers.filter(c => c.visits > 1).length;
            const rate = db.customers.length > 0 ? ((repeat / db.customers.length) * 100).toFixed(0) : 0;
            document.getElementById('repeatRate').textContent = `${rate}%`;
        }

        function updateGoalProgress() {
            const target = parseFloat(document.getElementById('salesTarget').value);
            const thisMonth = new Date().getMonth();
            const sales = db.income.filter(i => new Date(i.date).getMonth() === thisMonth).reduce((s, i) => s + i.amount, 0);
            const percent = target > 0 ? Math.min((sales / target) * 100, 100) : 0;

            document.getElementById('goalBar').style.width = `${percent}%`;
            document.getElementById('goalBar').textContent = `${percent.toFixed(0)}%`;
        }

        function launchCampaign() {
            const name = document.getElementById('campaignName').value;
            alert(`Campaign "${name}" launched!`);
            document.getElementById('campaignName').value = '';
            document.getElementById('campaignImpact').value = '';
        }

        // ===== DASHBOARD =====
        function updateDashboard() {
            const today = new Date().toLocaleDateString();
            const todayInc = db.income.filter(i => i.date === today).reduce((s, i) => s + i.amount, 0);
            const todayExp = db.expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
            const profit = todayInc - todayExp;

            document.getElementById('dashIncome').textContent = `$${todayInc.toFixed(2)}`;
            document.getElementById('dashExpense').textContent = `$${todayExp.toFixed(2)}`;
            document.getElementById('dashProfit').textContent = `$${profit.toFixed(2)}`;
            document.getElementById('dashOrders').textContent = db.orders.filter(o => o.date.includes(today)).length;

            updateTopProducts();
            updateRecentOrders();
        }

        function updateTopProducts() {
            const products = db.products.slice(0, 5);
            document.getElementById('topProducts').innerHTML = '<ol>' + 
                products.map(p => `<li>${p.name}: <span class="badge bg-success">$${(p.price).toFixed(2)}</span></li>`).join('') + 
                '</ol>';
        }

        function updateRecentOrders() {
            const orders = db.orders.slice(-5).reverse();
            document.getElementById('recentOrders').innerHTML = orders.length === 0 ? 
                '<p class="text-muted">No orders</p>' :
                orders.map(o => `
                    <div class="order-item">
                        <div>
                            <strong>${o.date}</strong><br>
                            <small>${o.items.length} items</small>
                        </div>
                        <span class="badge bg-success">$${o.total.toFixed(2)}</span>
                    </div>
                `).join('');
        }

        // ===== REPORTS =====
        function updateReports() {
            updateTrendChart();
            updateProductChart();
        }

        function generateDailyReport() {
            const today = new Date().toLocaleDateString();
            const inc = db.income.filter(i => i.date === today).reduce((s, i) => s + i.amount, 0);
            const exp = db.expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
            
            db.reports.push({
                type: 'Daily',
                date: today,
                income: inc,
                expense: exp,
                profit: inc - exp
            });
            saveData();
            displayReports();
            alert('Daily report generated');
        }

        function generateWeeklyReport() {
            alert('Weekly report generated');
        }

        function generateMonthlyReport() {
            alert('Monthly report generated');
        }

        function displayReports() {
            const list = document.getElementById('reportsList');
            list.innerHTML = db.reports.length === 0 ? '<p class="text-muted">No reports</p>' :
                db.reports.map(r => `
                    <div class="alert alert-info mb-2">
                        <strong>${r.type} (${r.date}):</strong> Income $${r.income.toFixed(2)} | Expense $${r.expense.toFixed(2)} | Profit $${r.profit.toFixed(2)}
                    </div>
                `).join('');
        }

        function exportData() {
            const json = JSON.stringify(db, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `coffee-shop-${new Date().toLocaleDateString()}.json`;
            a.click();
        }

        function updateTrendChart() {
            const ctx = document.getElementById('trendChart');
            if (!ctx) return;

            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                days.push(d.toLocaleDateString());
            }

            const sales = days.map(day => db.orders.filter(o => o.date.includes(day)).reduce((s, o) => s + o.total, 0));

            const chart = Chart.getChart(ctx);
            if (chart) chart.destroy();

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days.map(d => d.substring(5)),
                    datasets: [{
                        label: 'Sales',
                        data: sales,
                        borderColor: '#8B6F47',
                        backgroundColor: 'rgba(139, 111, 71, 0.1)',
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        function updateProductChart() {
            const ctx = document.getElementById('productChart');
            if (!ctx) return;

            const prods = db.products.slice(0, 6);
            const sales = prods.map(() => Math.random() * 20);

            const chart = Chart.getChart(ctx);
            if (chart) chart.destroy();

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: prods.map(p => p.name),
                    datasets: [{
                        label: 'Units',
                        data: sales,
                        backgroundColor: '#8B6F47'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // ===== INIT =====
        loadData();
        updateDashboard();