import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import { Container, Owner, Loading, BackButton, IssuesList, PageActions, FilterList} from './styles'
import {FaSpinner, FaArrowLeft} from 'react-icons/fa'
import api from '../../services/api'


export default function Repositorio(){
  const params = useParams();
  const [repositorio, setRepositorio] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1)
  const [filters, setFilters] = useState([
    {state : 'all', label: 'Todas', active: true},
    {state : 'open', label: 'Abertas', active: false},
    {state : 'closed', label: 'Fechados', active: false}
  ])
  
  const [filterIndex, setFilterIndex] = useState(0);

  useEffect(() => {
    const url = params.repositorio

    async function load(params) {
      const nomeRepo = decodeURIComponent(url)

      const [repositorioData, issuesData] = await Promise.all([
        api.get(`/repos/${nomeRepo}`),
        api.get(`/repos/${nomeRepo}/issues`, {
          params: {
            state: filters.find(f => f.active).state,
            per_page: 5
          }
        })
      ]);

      setRepositorio(repositorioData.data)
      setIssues(issuesData.data)
      setLoading(false)
    }

    load()

  }, [params.repositorio])



	useEffect(() => {

		const url = params.repositorio
		async function loadIssue(){
			const nomeRepo = decodeURIComponent(url)

			const response = await api.get(`/repos/${nomeRepo}/issues`, {
				params: {
					state: filters[filterIndex].state,
					page,
					per_page :5,
				}
			})

			setIssues(response.data)
		}

		loadIssue()
	}, [params.repositorio ,page, filterIndex, filters])

	function handlePage(action){
		setPage(action === 'back' ? page -1 : page +1)
	}

  function handleFilter(index){
    setFilterIndex(index)
  }

  if(loading){
    return(
      <Loading ready={loading ? true : false}>
        <FaSpinner size={80} />
      </Loading>
    );
  }

  return(
    <Container>
      <BackButton to={'/'}>
        <FaArrowLeft color={'#000'} size={35}/>
      </BackButton>
      <Owner>
        <img 
        src={repositorio.owner.avatar_url} 
        alt={ repositorio.owner.login}
        />

        <h1>{repositorio.name.toUpperCase()}</h1>
        <p>{repositorio.description}</p>
      </Owner>

      <FilterList active={filterIndex}>
        {filters.map((filter, index) => (
          <button
          type='button'
          key={filter.label}
          onClick={() => handleFilter(index)}
          >
            {filter.label}
          </button>
        ))}
      </FilterList>


      <IssuesList>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login}/>

            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
              </strong>
              <p>
                {issue.user.login}
              </p>
            </div>
          </li>
        ))}

      </IssuesList>
      <PageActions>
				<button 
        type="button" 
        onClick={() => handlePage('back')}
        disabled={page < 2}

        >
					Voltar
				</button>
				<button type="button" onClick={() => handlePage('next')}>
					Proximo
				</button>
      </PageActions>


    </Container>
  )
}