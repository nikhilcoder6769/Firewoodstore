const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const manageCategoriesModal = `
      {/* Manage Categories Modal */}
      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[80vh] flex flex-col">
            <button 
              onClick={() => setIsManageCategoriesOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-background transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8 flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>
              
              <div className="bg-background border border-border p-6 rounded-xl mb-8">
                <h3 className="font-bold mb-4">Add New Category</h3>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Category ID (e.g. tools)" 
                    value={newCategory.id}
                    onChange={e => setNewCategory({...newCategory, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')})}
                    className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Display Name (e.g. Tools & Plugins)" 
                    value={newCategory.name}
                    onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                    className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-sm"
                  />
                  <button 
                    onClick={async () => {
                      if (!newCategory.id || !newCategory.name) return;
                      try {
                        await setDoc(doc(db, 'categories', newCategory.id), newCategory);
                        setNewCategory({ id: '', name: '' });
                      } catch (err) {
                        console.error(err);
                        alert('Failed to add category');
                      }
                    }}
                    className="bg-primary hover:bg-button-hover text-white px-6 py-2 rounded-xl font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {categories.length > 0 ? (
                <div className="space-y-3">
                  {categories.map(category => (
                    <div key={category.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-background p-4 rounded-lg border border-border gap-4">
                      <div>
                        <span className="font-bold block">{category.name}</span>
                        <span className="text-sm text-text-secondary">ID: {category.id}</span>
                      </div>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this category?')) {
                            try {
                              await deleteDoc(doc(db, 'categories', category.id));
                            } catch (error) {
                              console.error('Error deleting category:', error);
                              alert('Failed to delete category.');
                            }
                          }
                        }}
                        className="text-error hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only sm:not-sr-only sm:text-sm">Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-8">No categories found.</p>
              )}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  `{/* Manage Products Modal */}`,
  manageCategoriesModal + `\n      {/* Manage Products Modal */}`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
