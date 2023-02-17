import { GithubUser } from './githubUsers.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }
  
  async add(username) {
    try {
      const userExists = this.entries
        .map(entry => entry.login.toLowerCase())
        .find(entry => entry === username.toLowerCase())
        
      if(userExists) {
        throw new Error('User already exists')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('User not found')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  emptyState() {
    const removeHide = this.root.querySelector('.empty-state')
    const addHide = this.root.querySelector('.empty-state')

    if (this.entries.length === 0) {
      removeHide.classList.remove('hide')
    } else {
      addHide.classList.add('hide')
    }
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')

    window.document.onkeyup = event => {
      if(event.key === "Enter"){ 
        let { value } = this.root.querySelector('.search input')
        
        this.add(value)
        value = this.root.querySelector('.search input').value = ''
      }
    }

    addButton.onclick = () => {
      let { value } = this.root.querySelector('.search input')

      this.add(value)
      value = this.root.querySelector('.search input').value = ''
    }
  }

  update() {
    this.emptyState()
    this.removeAllTr()

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Are you sure?')
        if (isOk) {
          this.delete(user)
        }
      }
      
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="remove">Remove</button>
      </td>
    `
    
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }
}
